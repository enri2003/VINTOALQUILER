import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoImpulso, Impulso, PlanImpulso } from './impulso.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { AnuncioService, DIAS_VENCIMIENTO } from '../anuncio/anuncio.service';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';
import { NotificacionService } from '../notificacion/notificacion.service';

export const PLANES_IMPULSO: Record<PlanImpulso, { dias: number; precio: number; fotosMax: number; portada: boolean }> = {
  7: { dias: 7, precio: 20, fotosMax: 8, portada: false },
  15: { dias: 15, precio: 35, fotosMax: 10, portada: true },
  30: { dias: 30, precio: 55, fotosMax: 12, portada: true },
};

@Injectable()
export class ImpulsoService {
  private readonly logger = new Logger(ImpulsoService.name);

  constructor(
    @InjectRepository(Impulso)
    private readonly impulsoRepo: Repository<Impulso>,
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    private readonly anuncioService: AnuncioService,
    private readonly almacenamientoService: AlmacenamientoService,
    private readonly notificacionService: NotificacionService,
  ) {}

  async solicitar(
    anuncioId: number,
    publicadorId: number,
    plan: PlanImpulso,
    comprobante: Express.Multer.File,
  ): Promise<Impulso> {
    const anuncio = await this.anuncioRepo.findOne({ where: { id: anuncioId }, relations: ['publicador'] });
    if (!anuncio || anuncio.publicador.id !== publicadorId) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    const configuracion = PLANES_IMPULSO[plan];
    if (!configuracion) {
      throw new BadRequestException('Plan de impulso invalido');
    }

    const comprobanteUrl = await this.almacenamientoService.subirArchivo(
      comprobante.buffer,
      comprobante.mimetype,
      'comprobantes',
    );

    const impulso = this.impulsoRepo.create({
      anuncio: { id: anuncioId } as any,
      plan,
      precio: configuracion.precio,
      comprobanteUrl,
      estado: 'pendiente',
    });
    const guardado = await this.impulsoRepo.save(impulso);

    if (process.env.ADMIN_EMAIL) {
      this.notificacionService
        .enviarCorreo(
          process.env.ADMIN_EMAIL,
          'Nueva solicitud de Impulso pendiente de pago',
          `<p>Se registro una nueva solicitud de Impulso.</p>
           <p><strong>${anuncio.titulo}</strong> · Plan ${plan} dias · Bs. ${configuracion.precio}</p>
           <p>Revisa el comprobante y activala desde el panel de administracion.</p>`,
        )
        .catch((error) => this.logger.error('No se pudo notificar al admin sobre el nuevo impulso', error));
    }

    return guardado;
  }

  listarMios(publicadorId: number): Promise<Impulso[]> {
    return this.impulsoRepo.find({
      where: { anuncio: { publicador: { id: publicadorId } as any } },
      relations: ['anuncio'],
      order: { creadoEn: 'DESC' },
    });
  }

  listarPendientes(): Promise<Impulso[]> {
    return this.impulsoRepo.find({
      where: { estado: 'pendiente' },
      relations: ['anuncio', 'anuncio.publicador'],
      order: { creadoEn: 'ASC' },
    });
  }

  listarActivos(): Promise<Impulso[]> {
    return this.impulsoRepo.find({
      where: { estado: 'activo' },
      relations: ['anuncio', 'anuncio.publicador'],
      order: { finEn: 'ASC' },
    });
  }

  async activar(id: number): Promise<Impulso> {
    const impulso = await this.impulsoRepo.findOne({ where: { id }, relations: ['anuncio'] });
    if (!impulso) {
      throw new NotFoundException('Impulso no encontrado');
    }
    if (impulso.estado !== 'pendiente') {
      throw new BadRequestException('Este impulso ya fue procesado');
    }

    const configuracion = PLANES_IMPULSO[impulso.plan];
    const inicioEn = new Date();
    const finEn = new Date();
    finEn.setDate(finEn.getDate() + configuracion.dias);

    impulso.estado = 'activo';
    impulso.inicioEn = inicioEn;
    impulso.finEn = finEn;
    await this.impulsoRepo.save(impulso);

    await this.anuncioService.activarImpulso(impulso.anuncio.id, {
      fotosMax: configuracion.fotosMax,
      impulsadoHasta: finEn,
      enPortada: configuracion.portada,
    });

    return impulso;
  }

  async rechazar(id: number, motivo?: string): Promise<Impulso> {
    const impulso = await this.impulsoRepo.findOne({ where: { id } });
    if (!impulso) {
      throw new NotFoundException('Impulso no encontrado');
    }
    if (impulso.estado !== 'pendiente') {
      throw new BadRequestException('Este impulso ya fue procesado');
    }
    impulso.estado = 'rechazado' as EstadoImpulso;
    impulso.motivoRechazo = motivo || 'Comprobante no válido';
    return this.impulsoRepo.save(impulso);
  }

  async reimpulsarVencimientoMedio(): Promise<number> {
    const impulsos = await this.impulsoRepo.find({
      where: { estado: 'activo', plan: 30, reimpulsoHecho: false },
      relations: ['anuncio'],
    });
    let contador = 0;
    const ahora = new Date();
    for (const impulso of impulsos) {
      const mitad = new Date(impulso.inicioEn);
      mitad.setDate(mitad.getDate() + 15);
      if (ahora >= mitad) {
        const nuevoVenceEn = new Date(ahora);
        nuevoVenceEn.setDate(nuevoVenceEn.getDate() + DIAS_VENCIMIENTO);
        await this.anuncioRepo.update(impulso.anuncio.id, { venceEn: nuevoVenceEn });
        impulso.reimpulsoHecho = true;
        await this.impulsoRepo.save(impulso);
        contador++;
      }
    }
    return contador;
  }
}
