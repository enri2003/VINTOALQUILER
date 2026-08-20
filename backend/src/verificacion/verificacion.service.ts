import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyzeIDCommand } from '@aws-sdk/client-textract';
import { CompareFacesCommand } from '@aws-sdk/client-rekognition';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Verificacion } from './verificacion.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { textractClient, rekognitionClient } from './aws.client';

const UMBRAL_SIMILITUD = 90;
const CLAVE_CIFRADO = Buffer.from((process.env.JWT_SECRET || 'cambiar_este_secreto').padEnd(32, '0').slice(0, 32));

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

  async procesarDocumento(anversoBuffer: Buffer, reversoBuffer: Buffer) {
    const resultado = await textractClient.send(
      new AnalyzeIDCommand({
        DocumentPages: [{ Bytes: anversoBuffer }, { Bytes: reversoBuffer }],
      }),
    );
    const campos = resultado.IdentityDocuments?.[0]?.IdentityDocumentFields || [];
    const campoCi = campos.find((campo) => campo.Type?.Text === 'DOCUMENT_NUMBER');
    return campoCi?.ValueDetection?.Text || '';
  }

  async procesarSelfie(
    usuarioId: number,
    anversoBuffer: Buffer,
    reversoBuffer: Buffer,
    selfieBuffer: Buffer,
  ) {
    const numeroCi = await this.procesarDocumento(anversoBuffer, reversoBuffer);

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
    return { verificado: !!usuario?.verificado };
  }
}
