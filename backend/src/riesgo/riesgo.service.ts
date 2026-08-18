import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { ReporteService } from '../reporte/reporte.service';

const DIAS_CUENTA_NUEVA = 30;
const SIMILITUD_TEXTO_MAXIMA = 0.85;

@Injectable()
export class RiesgoService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    private readonly reporteService: ReporteService,
  ) {}

  async evaluar(anuncioId: number) {
    const anuncio = await this.anuncioRepo.findOne({
      where: { id: anuncioId },
      relations: ['zona', 'publicador'],
    });
    if (!anuncio) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const senales: string[] = [];

    const precioAtipico = await this.precioEsAtipico(anuncio);
    if (precioAtipico) senales.push('precio_atipico_para_la_zona');

    const cuentaNueva = this.cuentaEsNueva(anuncio.publicador.creadoEn);
    if (cuentaNueva) senales.push('cuenta_del_publicador_reciente');

    const textoSimilar = await this.textoEsSimilar(anuncio);
    if (textoSimilar) senales.push('texto_similar_a_otro_anuncio');

    const reportes = await this.reporteService.contarPorAnuncio(anuncioId);
    if (reportes > 0) senales.push('anuncio_con_reportes');

    return { nivel: this.calcularNivel(senales.length), senales };
  }

  private async precioEsAtipico(anuncio: Anuncio): Promise<boolean> {
    const resultado = await this.anuncioRepo
      .createQueryBuilder('anuncio')
      .select('AVG(anuncio.precio)', 'promedio')
      .where('anuncio.zonaId = :zonaId', { zonaId: anuncio.zona.id })
      .andWhere('anuncio.tipo = :tipo', { tipo: anuncio.tipo })
      .getRawOne();

    const promedio = Number(resultado?.promedio);
    if (!promedio) return false;
    return anuncio.precio < promedio * 0.5 || anuncio.precio > promedio * 1.8;
  }

  private cuentaEsNueva(creadoEn: Date): boolean {
    const diasTranscurridos = (Date.now() - new Date(creadoEn).getTime()) / (1000 * 60 * 60 * 24);
    return diasTranscurridos < DIAS_CUENTA_NUEVA;
  }

  private async textoEsSimilar(anuncio: Anuncio): Promise<boolean> {
    const otros = await this.anuncioRepo.find({
      where: { zona: { id: anuncio.zona.id } as any },
    });
    return otros.some((otro) => {
      if (otro.id === anuncio.id) return false;
      return this.similitudTexto(anuncio.descripcion, otro.descripcion) > SIMILITUD_TEXTO_MAXIMA;
    });
  }

  private similitudTexto(a: string, b: string): number {
    const palabrasA = new Set(a.toLowerCase().split(/\s+/));
    const palabrasB = new Set(b.toLowerCase().split(/\s+/));
    const interseccion = [...palabrasA].filter((palabra) => palabrasB.has(palabra));
    const union = new Set([...palabrasA, ...palabrasB]);
    return union.size === 0 ? 0 : interseccion.length / union.size;
  }

  private calcularNivel(cantidadSenales: number): 'bajo' | 'medio' | 'alto' {
    if (cantidadSenales >= 3) return 'alto';
    if (cantidadSenales >= 1) return 'medio';
    return 'bajo';
  }
}
