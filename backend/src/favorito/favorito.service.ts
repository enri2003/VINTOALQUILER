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

  /** Del publicador solo se expone si está verificado; nunca sus datos personales. */
  async listar(usuarioId: number) {
    const favoritos = await this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['anuncio', 'anuncio.zona', 'anuncio.fotos', 'anuncio.publicador'],
    });
    return favoritos.map((favorito) => {
      const publicador = favorito.anuncio?.publicador;
      if (!publicador) return favorito;
      return {
        ...favorito,
        anuncio: { ...favorito.anuncio, publicador: { id: publicador.id, verificado: publicador.verificado } },
      };
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
    const existente = await this.favoritoRepo.findOne({ where: { usuarioId, anuncioId } });
    if (existente) return;
    const favorito = this.favoritoRepo.create({ usuarioId, anuncioId } as any);
    await this.favoritoRepo.save(favorito);
  }

  async quitar(usuarioId: number, anuncioId: number) {
    await this.favoritoRepo.delete({ usuarioId, anuncioId });
  }
}
