import { Controller, Get } from '@nestjs/common';
import { ObservatorioService } from './observatorio.service';

@Controller('observatorio')
export class ObservatorioController {
  constructor(private readonly observatorioService: ObservatorioService) {}

  @Get('indicadores')
  indicadores() {
    return this.observatorioService.indicadores();
  }

  @Get('precio-por-zona')
  precioPorZona() {
    return this.observatorioService.precioPorZona();
  }

  @Get('precio-por-tipo')
  precioPorTipo() {
    return this.observatorioService.precioPorTipo();
  }

  @Get('oferta-demanda')
  ofertaDemanda() {
    return this.observatorioService.ofertaDemandaPorZona();
  }
}
