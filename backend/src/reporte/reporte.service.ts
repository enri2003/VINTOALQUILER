import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from './reporte.entity';

@Injectable()
export class ReporteService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepo: Repository<Reporte>,
  ) {}

  crear(anuncioId: number, motivo: string, detalle?: string) {
    const reporte = this.reporteRepo.create({
      anuncio: { id: anuncioId } as any,
      motivo,
      detalle,
    });
    return this.reporteRepo.save(reporte);
  }

  contarPorAnuncio(anuncioId: number) {
    return this.reporteRepo.count({ where: { anuncio: { id: anuncioId } as any } });
  }

  listarTodos() {
    return this.reporteRepo.find({
      relations: ['anuncio', 'anuncio.publicador'],
      order: { creadoEn: 'DESC' },
    });
  }
}
