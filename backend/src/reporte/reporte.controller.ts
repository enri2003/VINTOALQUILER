import { Body, Controller, Post } from '@nestjs/common';
import { ReporteService } from './reporte.service';

@Controller('reportes')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  crear(@Body() datos: { anuncioId: number; motivo: string; detalle?: string }) {
    return this.reporteService.crear(datos.anuncioId, datos.motivo, datos.detalle);
  }
}
