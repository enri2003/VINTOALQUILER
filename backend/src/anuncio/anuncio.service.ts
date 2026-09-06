import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio, TipoAnuncio } from './anuncio.entity';
import { AlertaService } from '../alerta/alerta.service';
import { NotificacionService } from '../notificacion/notificacion.service';
import { UsuarioService } from '../usuario/usuario.service';

export const DIAS_VENCIMIENTO = 60;
const LIMITE_ANUNCIOS_ACTIVOS_GRATIS = 1;
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
  private readonly logger = new Logger(AnuncioService.name);

  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    private readonly alertaService: AlertaService,
    private readonly notificacionService: NotificacionService,
    private readonly usuarioService: UsuarioService,
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
      .leftJoinAndSelect('anuncio.publicador', 'publicador')
      .addSelect(
        'CASE WHEN anuncio.impulsadoHasta IS NOT NULL AND anuncio.impulsadoHasta > NOW() THEN 0 ELSE 1 END',
        'orden_impulso',
      )
      .where('anuncio.estado = :estado', { estado: 'disponible' })
      .orderBy('orden_impulso', 'ASC')
      .addOrderBy('anuncio.creadoEn', 'DESC')
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
    const usuario = await this.usuarioService.buscarPorId(publicadorId);
    if (usuario?.rol !== 'publicador') {
      throw new BadRequestException('Solo los publicadores pueden publicar anuncios');
    }
    const activos = await this.anuncioRepo.count({
      where: { publicador: { id: publicadorId } as any, estado: 'disponible' },
    });
    if (activos >= LIMITE_ANUNCIOS_ACTIVOS_GRATIS) {
      throw new BadRequestException(
        `Ya tienes ${LIMITE_ANUNCIOS_ACTIVOS_GRATIS} anuncio(s) activo(s). Pausa o elimina uno para publicar otro.`,
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

  async activarImpulso(
    anuncioId: number,
    datos: { fotosMax: number; impulsadoHasta: Date; enPortada: boolean },
  ): Promise<Anuncio> {
    const anuncio = await this.buscarPorId(anuncioId);
    anuncio.fotosMax = datos.fotosMax;
    anuncio.impulsadoHasta = datos.impulsadoHasta;
    anuncio.enPortada = datos.enPortada;
    const guardado = await this.anuncioRepo.save(anuncio);

    if (datos.enPortada) {
      this.notificarAlertasCoincidentes(guardado).catch((error) =>
        this.logger.error('No se pudieron enviar las notificaciones de alertas', error),
      );
    }

    return guardado;
  }

  async notificarAlertasCoincidentes(anuncio: Anuncio): Promise<void> {
    const zonaId = anuncio.zona?.id;
    if (!zonaId) return;
    const alertas = await this.alertaService.listarActivasPara(
      anuncio.tipo,
      zonaId,
      Number(anuncio.precio),
    );

    for (const alerta of alertas) {
      await this.notificacionService.enviarCorreo(
        alerta.usuario.correo,
        'Nuevo anuncio que coincide con tu alerta',
        `<p>Hola ${alerta.usuario.nombre},</p>
         <p>Se publico un nuevo anuncio en VintoAlquiler que coincide con tu alerta:</p>
         <p><strong>${anuncio.titulo}</strong> - Bs. ${anuncio.precio}</p>`,
      );
    }
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

  async moderarComoAdmin(id: number, estado: Anuncio['estado']) {
    const anuncio = await this.buscarPorId(id);
    anuncio.estado = estado;
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
    const resultado = await this.anuncioRepo
      .createQueryBuilder()
      .update(Anuncio)
      .set({ estado: 'pausado' })
      .where('estado = :estado', { estado: 'disponible' })
      .andWhere('venceEn < NOW()')
      .andWhere('(impulsadoHasta IS NULL OR impulsadoHasta < NOW())')
      .execute();
    return resultado.affected || 0;
  }
}
