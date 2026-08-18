import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio, TipoAnuncio } from './anuncio.entity';

@Injectable()
export class AnuncioService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
  ) {}

  listar(filtros: { zonaId?: number; tipo?: TipoAnuncio; precioMax?: number }) {
    const consulta = this.anuncioRepo
      .createQueryBuilder('anuncio')
      .leftJoinAndSelect('anuncio.zona', 'zona')
      .leftJoinAndSelect('anuncio.fotos', 'fotos')
      .where('anuncio.estado = :estado', { estado: 'disponible' });

    if (filtros.zonaId) {
      consulta.andWhere('zona.id = :zonaId', { zonaId: filtros.zonaId });
    }
    if (filtros.tipo) {
      consulta.andWhere('anuncio.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.precioMax) {
      consulta.andWhere('anuncio.precio <= :precioMax', { precioMax: filtros.precioMax });
    }

    return consulta.getMany();
  }

  async buscarPorId(id: number) {
    const anuncio = await this.anuncioRepo.findOne({
      where: { id },
      relations: ['zona', 'fotos', 'publicador'],
    });
    if (!anuncio) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    return anuncio;
  }

  crear(publicadorId: number, datos: Partial<Anuncio>) {
    const anuncio = this.anuncioRepo.create({
      ...datos,
      publicador: { id: publicadorId } as any,
    });
    return this.anuncioRepo.save(anuncio);
  }

  async actualizar(id: number, publicadorId: number, datos: Partial<Anuncio>) {
    const anuncio = await this.buscarPorId(id);
    if (anuncio.publicador.id !== publicadorId) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    Object.assign(anuncio, datos);
    return this.anuncioRepo.save(anuncio);
  }

  async eliminar(id: number, publicadorId: number) {
    const anuncio = await this.buscarPorId(id);
    if (anuncio.publicador.id !== publicadorId) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    await this.anuncioRepo.remove(anuncio);
  }

  listarPorPublicador(publicadorId: number) {
    return this.anuncioRepo.find({
      where: { publicador: { id: publicadorId } as any },
      relations: ['zona', 'fotos'],
    });
  }
}
