import { ForbiddenException } from '@nestjs/common';
import { textractClient, rekognitionClient } from './aws.client';
import { VerificacionService } from './verificacion.service';

jest.mock('./aws.client', () => ({
  textractClient: { send: jest.fn() },
  rekognitionClient: { send: jest.fn() },
}));

const textract = textractClient.send as jest.Mock;
const rekognition = rekognitionClient.send as jest.Mock;
const imagen = Buffer.from('imagen');

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

function simularAws(similitud: number) {
  textract.mockResolvedValue({
    IdentityDocuments: [{ IdentityDocumentFields: [{ Type: { Text: 'DOCUMENT_NUMBER' }, ValueDetection: { Text: '1234567' } }] }],
  });
  rekognition.mockResolvedValue({ FaceMatches: similitud ? [{ Similarity: similitud }] : [] });
}

describe('VerificacionService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('aprueba y marca la cuenta como verificada con similitud >= 90%', async () => {
    simularAws(97.5);
    const { servicio, usuarioService } = crearServicio(0);
    const r = await servicio.procesarSelfie(1, imagen, imagen, imagen);
    expect(r).toEqual({ resultado: 'aprobado', similitud: 97.5 });
    expect(usuarioService.marcarVerificado).toHaveBeenCalledWith(1);
  });

  it('rechaza sin marcar la cuenta cuando la similitud es menor a 90%', async () => {
    simularAws(72);
    const { servicio, usuarioService } = crearServicio(0);
    const r = await servicio.procesarSelfie(1, imagen, imagen, imagen);
    expect(r.resultado).toBe('rechazado');
    expect(usuarioService.marcarVerificado).not.toHaveBeenCalled();
  });

  it('rechaza cuando Rekognition no encuentra coincidencia de rostro', async () => {
    simularAws(0);
    const { servicio } = crearServicio(0);
    await expect(servicio.procesarSelfie(1, imagen, imagen, imagen)).resolves.toEqual({ resultado: 'rechazado', similitud: 0 });
  });

  it('cifra el numero de CI con AES-256-CBC y no lo guarda en texto plano', async () => {
    simularAws(95);
    const { servicio, verificacionRepo } = crearServicio(0);
    await servicio.procesarSelfie(1, imagen, imagen, imagen);
    const guardado = verificacionRepo.create.mock.calls[0][0];
    expect(guardado.ciCifrado).not.toContain('1234567');
    expect(guardado.ciCifrado).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
  });

  it('bloquea el cuarto intento tras tres rechazos (HU-09) sin llamar a AWS', async () => {
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
