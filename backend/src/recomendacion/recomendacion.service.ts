import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vista } from './vista.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Favorito } from '../favorito/favorito.entity';

@Injectable()
export class RecomendacionService {
  constructor(
    @InjectRepository(Vista)
    private readonly vistaRepo: Repository<Vista>,
    @InjectRepository(Favorito)
    private readonly favoritoRepo: Repository<Favorito>,
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
  ) {}

  async registrarVista(usuarioId: number, anuncioId: number) {
    const vista = this.vistaRepo.create({
      usuario: { id: usuarioId } as any,
      anuncio: { id: anuncioId } as any,
    });
    await this.vistaRepo.save(vista);
  }

  async recomendar(usuarioId: number): Promise<Anuncio[]> {
    const vistas = await this.vistaRepo.find({
      where: { usuario: { id: usuarioId } as any },
      relations: ['anuncio', 'anuncio.zona'],
    });
    const favoritos = await this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['anuncio', 'anuncio.zona'],
    });

    const anunciosVistos = [...vistas.map((v) => v.anuncio), ...favoritos.map((f) => f.anuncio)];
    if (anunciosVistos.length === 0) {
      return this.anuncioRepo.find({ where: { estado: 'disponible' }, take: 10 });
    }

    const zonasFrecuentes = this.contarFrecuencias(anunciosVistos.map((a) => a.zona.id));
    const tiposFrecuentes = this.contarFrecuencias(anunciosVistos.map((a) => a.tipo));
    const idsVistos = new Set(anunciosVistos.map((a) => a.id));

    const candidatos = await this.anuncioRepo.find({
      where: { estado: 'disponible' },
      relations: ['zona', 'fotos'],
    });

    return candidatos
      .filter((anuncio) => !idsVistos.has(anuncio.id))
      .map((anuncio) => ({
        anuncio,
        puntaje:
          (zonasFrecuentes[anuncio.zona.id] || 0) * 2 + (tiposFrecuentes[anuncio.tipo] || 0),
      }))
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 10)
      .map((resultado) => resultado.anuncio);
  }

  private contarFrecuencias(valores: (string | number)[]): Record<string, number> {
    return valores.reduce((acumulado: Record<string, number>, valor) => {
      acumulado[valor] = (acumulado[valor] || 0) + 1;
      return acumulado;
    }, {});
  }
}
