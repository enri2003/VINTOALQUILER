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
}
