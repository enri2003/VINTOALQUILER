import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';

@Injectable()
export class ObservatorioService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
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
