import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Anuncio, TipoAnuncio } from './anuncio.entity';
import { SuscripcionService } from '../suscripcion/suscripcion.service';

const DIAS_VENCIMIENTO = 60;
const CAMPOS_COMPLETITUD: (keyof Anuncio)[] = [
  'titulo',
  'descripcion',
  'precio',
  'superficieM2',
  'ambientes',
  'referencia',
  'garantia',
  'contratoMinimo',
];

interface DatosAnuncio {
  zonaId?: number;
  tipo?: TipoAnuncio;
  titulo?: string;
  descripcion?: string;
  precio?: number;
  superficieM2?: number;
  ambientes?: number;
  referencia?: string;
  direccionExacta?: string;
  servicios?: string[];
  garantia?: string;
  contratoMinimo?: string;
  estado?: Anuncio['estado'];
}

@Injectable()
export class AnuncioService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    private readonly suscripcionService: SuscripcionService,
  ) {}

  async listar(filtros: {
    zonaId?: number;
    tipo?: TipoAnuncio;
    precioMax?: number;
    pagina?: number;
    porPagina?: number;
  }) {
    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const porPagina = filtros.porPagina && filtros.porPagina > 0 ? filtros.porPagina : 20;

    const consulta = this.anuncioRepo
      .createQueryBuilder('anuncio')
      .leftJoinAndSelect('anuncio.zona', 'zona')
      .leftJoinAndSelect('anuncio.fotos', 'fotos')
      .where('anuncio.estado = :estado', { estado: 'disponible' })
      .orderBy('anuncio.creadoEn', 'DESC')
      .skip((pagina - 1) * porPagina)
      .take(porPagina);

    if (filtros.zonaId) {
      consulta.andWhere('zona.id = :zonaId', { zonaId: filtros.zonaId });
    }
    if (filtros.tipo) {
      consulta.andWhere('anuncio.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.precioMax) {
      consulta.andWhere('anuncio.precio <= :precioMax', { precioMax: filtros.precioMax });
    }

    const [datos, total] = await consulta.getManyAndCount();
    return { datos, total, pagina, porPagina };
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

  private calcularCompletitud(anuncio: Partial<Anuncio>): number {
    const llenos = CAMPOS_COMPLETITUD.filter((campo) => {
      const valor = anuncio[campo];
      return valor !== undefined && valor !== null && valor !== '';
    });
    return Math.round((llenos.length / CAMPOS_COMPLETITUD.length) * 100);
  }

  async crear(publicadorId: number, datos: DatosAnuncio) {
    const plan = await this.suscripcionService.planActual(publicadorId);
    const limites = this.suscripcionService.limites(plan);
    const activos = await this.anuncioRepo.count({
      where: { publicador: { id: publicadorId } as any, estado: 'disponible' },
    });
    if (activos >= limites.anunciosActivos) {
      throw new BadRequestException(
        `Tu plan ${plan} permite hasta ${limites.anunciosActivos} anuncios activos`,
      );
    }

    const { zonaId, ...resto } = datos;
    const venceEn = new Date();
    venceEn.setDate(venceEn.getDate() + DIAS_VENCIMIENTO);

    const anuncio = this.anuncioRepo.create({
      ...resto,
      zona: zonaId ? ({ id: zonaId } as any) : undefined,
      publicador: { id: publicadorId } as any,
      completitud: this.calcularCompletitud(resto),
      venceEn,
    });
    return this.anuncioRepo.save(anuncio);
  }

  async actualizar(id: number, publicadorId: number, datos: DatosAnuncio) {
    const anuncio = await this.buscarPorId(id);
    if (anuncio.publicador.id !== publicadorId) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const { zonaId, ...resto } = datos;
    Object.assign(anuncio, resto);
    if (zonaId) {
      anuncio.zona = { id: zonaId } as any;
    }
    anuncio.completitud = this.calcularCompletitud(anuncio);
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
      order: { creadoEn: 'DESC' },
    });
  }

  async pausarVencidos(): Promise<number> {
    const resultado = await this.anuncioRepo.update(
      { estado: 'disponible', venceEn: LessThan(new Date()) },
      { estado: 'pausado' },
    );
    return resultado.affected || 0;
  }
}
