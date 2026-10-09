import { NotFoundException } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';

const DIA = 1000 * 60 * 60 * 24;
const DESCRIPCION_BASE = 'cuarto amplio con bano privado cerca de la universidad agua y luz incluidos';

interface Escenario {
  precio: number;
  promedioZona: number;
  diasCuenta: number;
  descripcion?: string;
  otrasDescripciones?: string[];
  reportes?: number;
}

function crearServicio(e: Escenario) {
  const anuncio = {
    id: 1,
    tipo: 'cuarto',
    precio: e.precio,
    descripcion: e.descripcion ?? DESCRIPCION_BASE,
    zona: { id: 10 },
    publicador: { creadoEn: new Date(Date.now() - e.diasCuenta * DIA) },
  };
  const otros = (e.otrasDescripciones ?? []).map((descripcion, i) => ({ id: 100 + i, descripcion }));
  const anuncioRepo = {
    findOne: jest.fn().mockResolvedValue(anuncio),
    find: jest.fn().mockResolvedValue([anuncio, ...otros]),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ promedio: String(e.promedioZona) }),
    })),
  };
  const reporteService = { contarPorAnuncio: jest.fn().mockResolvedValue(e.reportes ?? 0) };
  return new RiesgoService(anuncioRepo as any, reporteService as any);
}

describe('RiesgoService', () => {
  it('lanza NotFoundException si el anuncio no existe', async () => {
    const servicio = new RiesgoService({ findOne: jest.fn().mockResolvedValue(null) } as any, {} as any);
    await expect(servicio.evaluar(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('senal: precio atipico (fuera de 0.5x a 1.8x del promedio de zona y tipo)', () => {
    it.each([
      [500, false],
      [250, false], // limite inferior exacto: 0.5x no es atipico
      [249, true],
      [900, false], // limite superior exacto: 1.8x no es atipico
      [901, true],
    ])('precio %i con promedio 500 -> atipico = %s', async (precio, esperado) => {
      const r = await crearServicio({ precio, promedioZona: 500, diasCuenta: 365 }).evaluar(1);
      expect(r.senales.includes('precio_atipico_para_la_zona')).toBe(esperado);
    });
  });

  describe('senal: cuenta reciente (menos de 30 dias)', () => {
    it.each([
      [5, true],
      [29, true],
      [31, false],
    ])('cuenta de %i dias -> reciente = %s', async (diasCuenta, esperado) => {
      const r = await crearServicio({ precio: 500, promedioZona: 500, diasCuenta }).evaluar(1);
      expect(r.senales.includes('cuenta_del_publicador_reciente')).toBe(esperado);
    });
  });

  describe('senal: texto similar (Jaccard > 0.85 en la misma zona)', () => {
    it('detecta una descripcion copiada', async () => {
      const r = await crearServicio({
        precio: 500, promedioZona: 500, diasCuenta: 365, otrasDescripciones: [DESCRIPCION_BASE],
      }).evaluar(1);
      expect(r.senales).toContain('texto_similar_a_otro_anuncio');
    });

    it('no marca descripciones distintas', async () => {
      const r = await crearServicio({
        precio: 500, promedioZona: 500, diasCuenta: 365,
        otrasDescripciones: ['departamento de dos dormitorios con garaje y jardin en zona tranquila'],
      }).evaluar(1);
      expect(r.senales).not.toContain('texto_similar_a_otro_anuncio');
    });

    it('no compara el anuncio consigo mismo', async () => {
      const r = await crearServicio({ precio: 500, promedioZona: 500, diasCuenta: 365 }).evaluar(1);
      expect(r.senales).not.toContain('texto_similar_a_otro_anuncio');
    });
  });

  describe('senal: reportes de usuarios', () => {
    it.each([
      [0, false],
      [1, true],
      [4, true],
    ])('%i reportes -> senal activa = %s', async (reportes, esperado) => {
      const r = await crearServicio({ precio: 500, promedioZona: 500, diasCuenta: 365, reportes }).evaluar(1);
      expect(r.senales.includes('anuncio_con_reportes')).toBe(esperado);
    });
  });

  // Escenarios de validacion del modulo (Seccion 3.18): cada caso representa un tipo de
  // anuncio con su nivel de riesgo esperado segun las reglas definidas.
  describe('validacion de escenarios (nivel esperado vs. obtenido)', () => {
    const escenarios: [string, Escenario, 'bajo' | 'medio' | 'alto', number][] = [
      ['E1 Anuncio legitimo tipico', { precio: 500, promedioZona: 500, diasCuenta: 400 }, 'bajo', 0],
      ['E2 Publicador nuevo, anuncio normal', { precio: 520, promedioZona: 500, diasCuenta: 3 }, 'medio', 1],
      ['E3 Precio muy bajo (posible cebo)', { precio: 150, promedioZona: 500, diasCuenta: 400 }, 'medio', 1],
      ['E4 Precio muy alto', { precio: 1200, promedioZona: 500, diasCuenta: 400 }, 'medio', 1],
      ['E5 Anuncio con un reporte', { precio: 500, promedioZona: 500, diasCuenta: 400, reportes: 1 }, 'medio', 1],
      ['E6 Descripcion copiada', { precio: 500, promedioZona: 500, diasCuenta: 400, otrasDescripciones: [DESCRIPCION_BASE] }, 'medio', 1],
      ['E7 Cuenta nueva y precio cebo', { precio: 150, promedioZona: 500, diasCuenta: 2 }, 'medio', 2],
      ['E8 Cuenta nueva, precio cebo y copia', { precio: 150, promedioZona: 500, diasCuenta: 2, otrasDescripciones: [DESCRIPCION_BASE] }, 'alto', 3],
      ['E9 Fraude tipico (4 senales)', { precio: 150, promedioZona: 500, diasCuenta: 2, otrasDescripciones: [DESCRIPCION_BASE], reportes: 3 }, 'alto', 4],
      ['E10 Precio en el limite (1.8x)', { precio: 900, promedioZona: 500, diasCuenta: 400 }, 'bajo', 0],
    ];

    it.each(escenarios)('%s', async (_nombre, escenario, nivelEsperado, senalesEsperadas) => {
      const r = await crearServicio(escenario).evaluar(1);
      expect(r.nivel).toBe(nivelEsperado);
      expect(r.senales).toHaveLength(senalesEsperadas);
    });
  });
});
