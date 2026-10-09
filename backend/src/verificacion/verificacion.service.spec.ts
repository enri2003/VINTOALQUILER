import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CompareFacesCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition';
import { textractClient, rekognitionClient } from './aws.client';
import { VerificacionService } from './verificacion.service';

jest.mock('./aws.client', () => ({
  textractClient: { send: jest.fn() },
  rekognitionClient: { send: jest.fn() },
}));

const textract = textractClient.send as jest.Mock;
const rekognition = rekognitionClient.send as jest.Mock;
const imagen = Buffer.from('imagen');

const ROSTRO_BUENO = {
  Quality: { Sharpness: 70, Brightness: 60 },
  Pose: { Yaw: 3, Pitch: -2 },
  EyesOpen: { Value: true, Confidence: 99 },
};

interface Simulacion {
  similitud?: number;
  confianzaCi?: number;
  numeroCi?: string;
  rostrosDocumento?: unknown[];
  rostrosSelfie?: unknown[];
}

function crearServicio(rechazosPrevios: number) {
  const verificacionRepo = {
    count: jest.fn().mockResolvedValue(rechazosPrevios),
    create: jest.fn((datos) => datos),
    save: jest.fn(async (datos) => datos),
  };
  const usuarioService = {
    marcarVerificado: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({ id: 1, verificado: false }),
  };
  const servicio = new VerificacionService(verificacionRepo as any, usuarioService as any);
  return { servicio, verificacionRepo, usuarioService };
}

function simularAws(s: Simulacion = {}) {
  textract.mockResolvedValue({
    IdentityDocuments: [
      {
        IdentityDocumentFields: [
          { Type: { Text: 'DOCUMENT_NUMBER' }, ValueDetection: { Text: s.numeroCi ?? '1234567', Confidence: s.confianzaCi ?? 98 } },
        ],
      },
    ],
  });
  // La primera detección de rostros es del anverso y la segunda de la selfie.
  let detecciones = 0;
  rekognition.mockImplementation(async (comando) => {
    if (comando instanceof DetectFacesCommand) {
      detecciones += 1;
      return { FaceDetails: detecciones === 1 ? (s.rostrosDocumento ?? [ROSTRO_BUENO]) : (s.rostrosSelfie ?? [ROSTRO_BUENO]) };
    }
    if (comando instanceof CompareFacesCommand) {
      const similitud = s.similitud ?? 97.5;
      return { FaceMatches: similitud ? [{ Similarity: similitud }] : [] };
    }
    throw new Error('Comando no esperado');
  });
}

/** Ejecuta la verificación y devuelve el error de calidad (o falla si no lo hubo). */
async function errorDeCalidad(servicio: VerificacionService) {
  try {
    await servicio.procesarSelfie(1, imagen, imagen, imagen);
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).getResponse() as { codigo: string; paso: string; message: string };
  }
  throw new Error('Se esperaba un error de calidad');
}

describe('VerificacionService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('comparación facial', () => {
    it('aprueba y marca la cuenta como verificada con similitud >= 90%', async () => {
      simularAws({ similitud: 97.5 });
      const { servicio, usuarioService } = crearServicio(0);
      const r = await servicio.procesarSelfie(1, imagen, imagen, imagen);
      expect(r).toEqual({ resultado: 'aprobado', similitud: 97.5 });
      expect(usuarioService.marcarVerificado).toHaveBeenCalledWith(1);
    });

    it('rechaza sin marcar la cuenta cuando la similitud es menor a 90%', async () => {
      simularAws({ similitud: 72 });
      const { servicio, usuarioService } = crearServicio(0);
      const r = await servicio.procesarSelfie(1, imagen, imagen, imagen);
      expect(r.resultado).toBe('rechazado');
      expect(usuarioService.marcarVerificado).not.toHaveBeenCalled();
    });

    it('rechaza cuando Rekognition no encuentra coincidencia de rostro', async () => {
      simularAws({ similitud: 0 });
      const { servicio } = crearServicio(0);
      await expect(servicio.procesarSelfie(1, imagen, imagen, imagen)).resolves.toEqual({ resultado: 'rechazado', similitud: 0 });
    });

    it('cifra el número de CI con AES-256-CBC y no lo guarda en texto plano', async () => {
      simularAws();
      const { servicio, verificacionRepo } = crearServicio(0);
      await servicio.procesarSelfie(1, imagen, imagen, imagen);
      const guardado = verificacionRepo.create.mock.calls[0][0];
      expect(guardado.ciCifrado).not.toContain('1234567');
      expect(guardado.ciCifrado).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
    });
  });

  describe('controles de calidad (no gastan intentos)', () => {
    it.each([
      ['número de cédula ilegible', { numeroCi: '' }, 'anverso'],
      ['número de cédula con baja confianza', { confianzaCi: 40 }, 'anverso'],
      ['sin rostro en el anverso', { rostrosDocumento: [] }, 'anverso'],
      ['sin rostro en la selfie', { rostrosSelfie: [] }, 'selfie'],
      ['dos personas en la selfie', { rostrosSelfie: [ROSTRO_BUENO, ROSTRO_BUENO] }, 'selfie'],
      ['selfie borrosa', { rostrosSelfie: [{ ...ROSTRO_BUENO, Quality: { Sharpness: 4, Brightness: 60 } }] }, 'selfie'],
      ['selfie muy oscura', { rostrosSelfie: [{ ...ROSTRO_BUENO, Quality: { Sharpness: 70, Brightness: 8 } }] }, 'selfie'],
      ['selfie con demasiada luz', { rostrosSelfie: [{ ...ROSTRO_BUENO, Quality: { Sharpness: 70, Brightness: 99 } }] }, 'selfie'],
      ['rostro girado', { rostrosSelfie: [{ ...ROSTRO_BUENO, Pose: { Yaw: 45, Pitch: 0 } }] }, 'selfie'],
      ['ojos cerrados', { rostrosSelfie: [{ ...ROSTRO_BUENO, EyesOpen: { Value: false, Confidence: 97 } }] }, 'selfie'],
    ])('%s -> pide repetir la foto del paso "%s"', async (_caso, simulacion, paso) => {
      simularAws(simulacion as Simulacion);
      const { servicio, verificacionRepo, usuarioService } = crearServicio(0);
      const respuesta = await errorDeCalidad(servicio);
      expect(respuesta.codigo).toBe('CALIDAD');
      expect(respuesta.paso).toBe(paso);
      // No se registra ningún intento ni se compara el rostro.
      expect(verificacionRepo.save).not.toHaveBeenCalled();
      expect(usuarioService.marcarVerificado).not.toHaveBeenCalled();
      expect(rekognition.mock.calls.some(([comando]) => comando instanceof CompareFacesCommand)).toBe(false);
    });

    it('acepta ojos "cerrados" si Rekognition no está seguro (evita rechazos injustos)', async () => {
      simularAws({ rostrosSelfie: [{ ...ROSTRO_BUENO, EyesOpen: { Value: false, Confidence: 60 } }] });
      const { servicio } = crearServicio(0);
      await expect(servicio.procesarSelfie(1, imagen, imagen, imagen)).resolves.toMatchObject({ resultado: 'aprobado' });
    });
  });

  describe('límite de intentos (HU-09)', () => {
    it('bloquea el cuarto intento tras tres rechazos sin llamar a AWS', async () => {
      const { servicio } = crearServicio(3);
      await expect(servicio.procesarSelfie(1, imagen, imagen, imagen)).rejects.toBeInstanceOf(ForbiddenException);
      expect(textract).not.toHaveBeenCalled();
      expect(rekognition).not.toHaveBeenCalled();
    });

    it.each([
      [0, 3, false],
      [2, 1, false],
      [3, 0, true],
    ])('con %i rechazos informa %i intentos restantes (bloqueado = %s)', async (rechazos, restantes, bloqueado) => {
      const { servicio } = crearServicio(rechazos);
      await expect(servicio.estado(1)).resolves.toEqual({ verificado: false, intentosRestantes: restantes, bloqueado });
    });
  });
});
