import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './favorito.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class FavoritoService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritoRepo: Repository<Favorito>,
    private readonly usuarioService: UsuarioService,
  ) {}

  listar(usuarioId: number) {
    return this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['anuncio', 'anuncio.zona', 'anuncio.fotos'],
    });
  }

  async agregar(usuarioId: number, anuncioId: number) {
    const usuario = await this.usuarioService.buscarPorId(usuarioId);
    if (usuario?.rol !== 'interesado') {
      throw new ForbiddenException('Solo los interesados pueden guardar favoritos');
    }
    if (!usuario?.verificado) {
      throw new ForbiddenException('Debes verificar tu identidad para guardar favoritos');
    }
    const favorito = this.favoritoRepo.create({ usuarioId, anuncioId } as any);
    await this.favoritoRepo.save(favorito);
  }

  async quitar(usuarioId: number, anuncioId: number) {
    await this.favoritoRepo.delete({ usuarioId, anuncioId });
  }
}
