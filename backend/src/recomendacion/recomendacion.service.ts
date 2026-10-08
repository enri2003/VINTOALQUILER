import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vista } from './vista.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Favorito } from '../favorito/favorito.entity';
import { Usuario } from '../usuario/usuario.entity';

const PUNTAJE_MINIMO = 3;

const LIMITE_PRESUPUESTO: Record<string, number> = {
  hasta_500: 500,
  '501_800': 800,
  '801_1200': 1200,
  mas_1200: Number.POSITIVE_INFINITY,
};

@Injectable()
export class RecomendacionService {
  constructor(
    @InjectRepository(Vista)
    private readonly vistaRepo: Repository<Vista>,
    @InjectRepository(Favorito)
    private readonly favoritoRepo: Repository<Favorito>,
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async registrarVista(usuarioId: number, anuncioId: number) {
    const vista = this.vistaRepo.create({
      usuario: { id: usuarioId } as any,
      anuncio: { id: anuncioId } as any,
    });
    await this.vistaRepo.save(vista);
  }

  async recomendar(usuarioId: number): Promise<Anuncio[]> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId },
      relations: ['zonaInteres'],
    });

    const vistas = await this.vistaRepo.find({
      where: { usuario: { id: usuarioId } as any },
      relations: ['anuncio', 'anuncio.zona'],
    });
    const favoritos = await this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['anuncio', 'anuncio.zona'],
    });

    const anunciosVistos = [...vistas.map((v) => v.anuncio), ...favoritos.map((f) => f.anuncio)];
    const idsVistos = new Set(anunciosVistos.map((a) => a.id));
    const zonasFrecuentes = this.contarFrecuencias(anunciosVistos.map((a) => a.zona.id));
    const tiposFrecuentes = this.contarFrecuencias(anunciosVistos.map((a) => a.tipo));
    const presupuestoMax = LIMITE_PRESUPUESTO[usuario?.rangoPresupuesto ?? ''];

    const sinHistorial = anunciosVistos.length === 0;
    const sinPreferencias = !usuario?.tipoPreferido && !usuario?.zonaInteres && presupuestoMax === undefined;
    if (sinHistorial && sinPreferencias) {
      return this.anuncioRepo.find({
        where: { estado: 'disponible' },
        order: { creadoEn: 'DESC' },
        take: 10,
        relations: ['zona', 'fotos', 'publicador'],
      });
    }

    const candidatos = await this.anuncioRepo.find({
      where: { estado: 'disponible' },
      relations: ['zona', 'fotos', 'publicador'],
    });

    return candidatos
      .filter((anuncio) => !idsVistos.has(anuncio.id))
      .filter((anuncio) => anuncio.publicador?.id !== usuarioId)
      .filter((anuncio) => Number(anuncio.precio) > 0)
      .map((anuncio) => ({
        anuncio,
        puntaje: this.puntuar(anuncio, usuario, zonasFrecuentes, tiposFrecuentes, presupuestoMax),
      }))
      .filter((resultado) => resultado.puntaje >= PUNTAJE_MINIMO)
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 10)
      .map((resultado) => resultado.anuncio);
  }

  private puntuar(
    anuncio: Anuncio,
    usuario: Usuario | null,
    zonasFrecuentes: Record<string, number>,
    tiposFrecuentes: Record<string, number>,
    presupuestoMax: number | undefined,
  ): number {
    let puntaje = 0;
    if (usuario?.tipoPreferido === anuncio.tipo) puntaje += 3;
    else if (tiposFrecuentes[anuncio.tipo]) puntaje += 1;

    if (usuario?.zonaInteres?.id === anuncio.zona?.id) puntaje += 3;
    else if (anuncio.zona && zonasFrecuentes[anuncio.zona.id]) puntaje += 2;

    if (presupuestoMax !== undefined && Number(anuncio.precio) <= presupuestoMax) puntaje += 3;
    if (anuncio.publicador?.verificado) puntaje += 1;
    if (anuncio.fotos?.length) puntaje += 1;
    if (anuncio.enPortada) puntaje += 1;
    return puntaje;
  }

  private contarFrecuencias(valores: (string | number)[]): Record<string, number> {
    return valores.reduce((acumulado: Record<string, number>, valor) => {
      acumulado[valor] = (acumulado[valor] || 0) + 1;
      return acumulado;
    }, {});
  }
}
