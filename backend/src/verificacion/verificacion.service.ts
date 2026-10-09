import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyzeIDCommand } from '@aws-sdk/client-textract';
import { CompareFacesCommand, DetectFacesCommand, FaceDetail } from '@aws-sdk/client-rekognition';
import * as crypto from 'node:crypto';
import { Repository } from 'typeorm';
import { Verificacion } from './verificacion.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { textractClient, rekognitionClient } from './aws.client';

const UMBRAL_SIMILITUD = 90;
const INTENTOS_MAXIMOS = 3;
const CLAVE_CIFRADO = Buffer.from((process.env.CI_CIFRADO_SECRET || 'cambiar_este_secreto').padEnd(32, '0').slice(0, 32));

// Controles de calidad previos a la comparación. Son tolerantes a propósito: solo detienen
// fotos claramente inservibles, para no rechazar a usuarios con fotos aceptables.
const CONFIANZA_MINIMA_NUMERO_CI = 70; // % de confianza de Textract al leer el número de cédula
const NITIDEZ_MINIMA = 10; // Quality.Sharpness de Rekognition (0 a 100)
const BRILLO_MINIMO = 20; // Quality.Brightness de Rekognition (0 a 100)
const BRILLO_MAXIMO = 95;
const GIRO_MAXIMO_GRADOS = 30; // Yaw y Pitch: cara de frente
const CONFIANZA_OJOS_CERRADOS = 90; // solo se rechaza si Rekognition está muy seguro de que están cerrados

type PasoCaptura = 'anverso' | 'reverso' | 'selfie';

/**
 * Error de calidad: indica qué foto repetir. No se registra como intento fallido,
 * así el usuario no pierde ninguno de sus tres intentos por una foto mal tomada.
 */
function errorDeCalidad(paso: PasoCaptura, mensaje: string): BadRequestException {
  return new BadRequestException({ statusCode: 400, codigo: 'CALIDAD', paso, message: mensaje });
}

@Injectable()
export class VerificacionService {
  constructor(
    @InjectRepository(Verificacion)
    private readonly verificacionRepo: Repository<Verificacion>,
    private readonly usuarioService: UsuarioService,
  ) {}

  private cifrar(texto: string): string {
    const iv = crypto.randomBytes(16);
    const cifrador = crypto.createCipheriv('aes-256-cbc', CLAVE_CIFRADO, iv);
    const cifrado = Buffer.concat([cifrador.update(texto, 'utf8'), cifrador.final()]);
    return `${iv.toString('hex')}:${cifrado.toString('hex')}`;
  }

  /** Lee el número de cédula con Textract y exige una lectura confiable. */
  async procesarDocumento(anversoBuffer: Buffer, reversoBuffer: Buffer): Promise<string> {
    const resultado = await textractClient.send(
      new AnalyzeIDCommand({
        DocumentPages: [{ Bytes: anversoBuffer }, { Bytes: reversoBuffer }],
      }),
    );
    const campos = resultado.IdentityDocuments?.[0]?.IdentityDocumentFields || [];
    const campoCi = campos.find((campo) => campo.Type?.Text === 'DOCUMENT_NUMBER');
    const numero = campoCi?.ValueDetection?.Text?.trim() || '';
    const confianza = campoCi?.ValueDetection?.Confidence ?? 0;
    if (!numero || confianza < CONFIANZA_MINIMA_NUMERO_CI) {
      throw errorDeCalidad(
        'anverso',
        'No pudimos leer con claridad el número de tu cédula. Toma de nuevo las fotos con buena luz, sin reflejos y con el documento completo dentro del marco.',
      );
    }
    return numero;
  }

  private async detectarRostros(imagen: Buffer): Promise<FaceDetail[]> {
    const resultado = await rekognitionClient.send(new DetectFacesCommand({ Image: { Bytes: imagen }, Attributes: ['ALL'] }));
    return resultado.FaceDetails || [];
  }

  /** La foto del anverso debe mostrar el rostro impreso en la cédula. */
  private async validarRostroDocumento(anversoBuffer: Buffer): Promise<void> {
    const rostros = await this.detectarRostros(anversoBuffer);
    if (!rostros.length) {
      throw errorDeCalidad(
        'anverso',
        'No encontramos la foto de tu rostro en el anverso de la cédula. Asegúrate de que la foto del documento se vea completa y sin reflejos.',
      );
    }
  }

  /** La selfie debe tener una sola cara, nítida, bien iluminada, de frente y con los ojos abiertos. */
  private async validarSelfie(selfieBuffer: Buffer): Promise<void> {
    const rostros = await this.detectarRostros(selfieBuffer);
    if (!rostros.length) {
      throw errorDeCalidad('selfie', 'No detectamos tu rostro en la selfie. Centra tu cara dentro del círculo.');
    }
    if (rostros.length > 1) {
      throw errorDeCalidad('selfie', 'Aparece más de una persona en la selfie. Solo tú debes estar frente a la cámara.');
    }
    const rostro = rostros[0];
    const nitidez = rostro.Quality?.Sharpness ?? 100;
    const brillo = rostro.Quality?.Brightness ?? 50;
    if (nitidez < NITIDEZ_MINIMA) {
      throw errorDeCalidad('selfie', 'La selfie salió borrosa. Mantén el celular quieto y vuelve a intentarlo.');
    }
    if (brillo < BRILLO_MINIMO) {
      throw errorDeCalidad('selfie', 'La selfie salió muy oscura. Busca un lugar con más luz.');
    }
    if (brillo > BRILLO_MAXIMO) {
      throw errorDeCalidad('selfie', 'La selfie tiene demasiada luz. Aléjate un poco de la fuente de luz.');
    }
    const giro = Math.max(Math.abs(rostro.Pose?.Yaw ?? 0), Math.abs(rostro.Pose?.Pitch ?? 0));
    if (giro > GIRO_MAXIMO_GRADOS) {
      throw errorDeCalidad('selfie', 'Tu rostro no está de frente. Mira directamente a la cámara.');
    }
    if (rostro.EyesOpen?.Value === false && (rostro.EyesOpen.Confidence ?? 0) >= CONFIANZA_OJOS_CERRADOS) {
      throw errorDeCalidad('selfie', 'Tus ojos parecen cerrados. Mantenlos abiertos mientras se toma la selfie.');
    }
  }

  private async intentosFallidos(usuarioId: number): Promise<number> {
    return this.verificacionRepo.count({
      where: { usuario: { id: usuarioId } as any, resultado: 'rechazado' },
    });
  }

  async procesarSelfie(
    usuarioId: number,
    anversoBuffer: Buffer,
    reversoBuffer: Buffer,
    selfieBuffer: Buffer,
  ) {
    const fallidos = await this.intentosFallidos(usuarioId);
    if (fallidos >= INTENTOS_MAXIMOS) {
      throw new ForbiddenException(
        'Alcanzaste el límite de 3 intentos de verificación. Contacta a soporte para continuar.',
      );
    }

    // 1) Controles de calidad: si alguno falla, se pide repetir esa foto sin gastar un intento.
    const numeroCi = await this.procesarDocumento(anversoBuffer, reversoBuffer);
    await this.validarRostroDocumento(anversoBuffer);
    await this.validarSelfie(selfieBuffer);

    // 2) Comparación facial: este resultado sí cuenta como intento.
    const comparacion = await rekognitionClient.send(
      new CompareFacesCommand({
        SourceImage: { Bytes: anversoBuffer },
        TargetImage: { Bytes: selfieBuffer },
        SimilarityThreshold: UMBRAL_SIMILITUD,
      }),
    );
    const similitud = comparacion.FaceMatches?.[0]?.Similarity || 0;
    const resultado = similitud >= UMBRAL_SIMILITUD ? 'aprobado' : 'rechazado';

    const verificacion = this.verificacionRepo.create({
      usuario: { id: usuarioId } as any,
      ciCifrado: this.cifrar(numeroCi),
      similitudRostro: similitud,
      resultado,
    });
    await this.verificacionRepo.save(verificacion);

    if (resultado === 'aprobado') {
      await this.usuarioService.marcarVerificado(usuarioId);
    }

    return { resultado, similitud };
  }

  async estado(usuarioId: number) {
    const usuario = await this.usuarioService.buscarPorId(usuarioId);
    const fallidos = await this.intentosFallidos(usuarioId);
    return {
      verificado: !!usuario?.verificado,
      intentosRestantes: Math.max(0, INTENTOS_MAXIMOS - fallidos),
      bloqueado: fallidos >= INTENTOS_MAXIMOS,
    };
  }
}
