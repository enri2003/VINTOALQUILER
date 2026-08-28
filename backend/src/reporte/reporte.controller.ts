import { Body, Controller, Post } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { CrearReporteDto } from './dto/crear-reporte.dto';

@Controller('reportes')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  crear(@Body() datos: CrearReporteDto) {
    return this.reporteService.crear(datos.anuncioId, datos.motivo, datos.detalle);
  }
}
