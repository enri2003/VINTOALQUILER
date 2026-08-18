import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './favorito.entity';

@Injectable()
export class FavoritoService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritoRepo: Repository<Favorito>,
  ) {}

  listar(usuarioId: number) {
    return this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['anuncio', 'anuncio.zona', 'anuncio.fotos'],
    });
  }

  async agregar(usuarioId: number, anuncioId: number) {
    const favorito = this.favoritoRepo.create({ usuarioId, anuncioId } as any);
    await this.favoritoRepo.save(favorito);
  }

  async quitar(usuarioId: number, anuncioId: number) {
    await this.favoritoRepo.delete({ usuarioId, anuncioId });
  }
}
