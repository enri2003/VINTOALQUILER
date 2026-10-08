import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Usuario } from '../usuario/usuario.entity';

const MINIMO_REGISTROS_AGREGADOS = 10;

@Injectable()
export class ObservatorioService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async indicadores() {
    const resultado = await this.anuncioRepo
      .createQueryBuilder('anuncio')
      .select('COUNT(*)', 'totalAnuncios')
      .addSelect('AVG(anuncio.precio)', 'precioPromedio')
      .where('anuncio.estado = :estado', { estado: 'disponible' })
      .getRawOne();

    return {
      totalAnuncios: Number(resultado.totalAnuncios),
      precioPromedio: Number(resultado.precioPromedio) || 0,
    };
  }

  precioPorZona() {
    return this.anuncioRepo
      .createQueryBuilder('anuncio')
      .leftJoin('anuncio.zona', 'zona')
      .select('zona.nombre', 'zona')
      .addSelect('AVG(anuncio.precio)', 'precioPromedio')
      .addSelect('COUNT(*)', 'totalAnuncios')
      .where('anuncio.estado = :estado', { estado: 'disponible' })
      .groupBy('zona.nombre')
      .getRawMany();
  }

  precioPorTipo() {
    return this.anuncioRepo
      .createQueryBuilder('anuncio')
      .select('anuncio.tipo', 'tipo')
      .addSelect('AVG(anuncio.precio)', 'precioPromedio')
      .addSelect('COUNT(*)', 'totalAnuncios')
      .where('anuncio.estado = :estado', { estado: 'disponible' })
      .groupBy('anuncio.tipo')
      .getRawMany();
  }

  async demandaAgregada() {
    const base = () =>
      this.usuarioRepo
        .createQueryBuilder('usuario')
        .where('usuario.autorizaUsoEstadistico = true');

    const porMotivo = await base()
      .select('usuario.motivoBusqueda', 'motivo')
      .addSelect('COUNT(*)', 'total')
      .andWhere('usuario.motivoBusqueda IS NOT NULL')
      .groupBy('usuario.motivoBusqueda')
      .having('COUNT(*) >= :minimo', { minimo: MINIMO_REGISTROS_AGREGADOS })
      .getRawMany();

    const porTipoPreferido = await base()
      .select('usuario.tipoPreferido', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .andWhere('usuario.tipoPreferido IS NOT NULL')
      .groupBy('usuario.tipoPreferido')
      .having('COUNT(*) >= :minimo', { minimo: MINIMO_REGISTROS_AGREGADOS })
      .getRawMany();

    const porRangoPresupuesto = await base()
      .select('usuario.rangoPresupuesto', 'rango')
      .addSelect('COUNT(*)', 'total')
      .andWhere('usuario.rangoPresupuesto IS NOT NULL')
      .groupBy('usuario.rangoPresupuesto')
      .having('COUNT(*) >= :minimo', { minimo: MINIMO_REGISTROS_AGREGADOS })
      .getRawMany();

    const porZonaInteres = await base()
      .leftJoin('usuario.zonaInteres', 'zona')
      .select('zona.nombre', 'zona')
      .addSelect('COUNT(*)', 'total')
      .andWhere('usuario.zonaInteresId IS NOT NULL')
      .groupBy('zona.nombre')
      .having('COUNT(*) >= :minimo', { minimo: MINIMO_REGISTROS_AGREGADOS })
      .getRawMany();

    return {
      porMotivo: porMotivo.map((fila) => ({ motivo: fila.motivo, total: Number(fila.total) })),
      porTipoPreferido: porTipoPreferido.map((fila) => ({ tipo: fila.tipo, total: Number(fila.total) })),
      porRangoPresupuesto: porRangoPresupuesto.map((fila) => ({ rango: fila.rango, total: Number(fila.total) })),
      porZonaInteres: porZonaInteres.map((fila) => ({ zona: fila.zona, total: Number(fila.total) })),
    };
  }

  ofertaDemandaPorZona() {
    return this.anuncioRepo.query(`
      SELECT
        zona.nombre AS zona,
        COUNT(DISTINCT anuncio.id)::int AS oferta,
        COALESCE(SUM(
          (SELECT COUNT(*) FROM contacto WHERE contacto."anuncioId" = anuncio.id) +
          (SELECT COUNT(*) FROM favorito WHERE favorito."anuncioId" = anuncio.id)
        ), 0)::int AS demanda
      FROM anuncio
      LEFT JOIN zona ON zona.id = anuncio."zonaId"
      WHERE anuncio.estado = 'disponible'
      GROUP BY zona.nombre
      ORDER BY zona.nombre
    `);
  }
}
