import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ObservatorioService } from './observatorio.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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

  /** Indicadores de demanda agregada: solo para el administrador o una institución autorizada. */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('demanda-agregada')
  demandaAgregada() {
    return this.observatorioService.demandaAgregada();
  }
}
