import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuscripcionService } from './suscripcion.service';

/**
 * El plan Pro queda como trabajo futuro: la visibilidad paga se resuelve
 * ahora mediante el modulo de Impulso. Este controlador solo expone
 * lectura del plan (siempre "gratuito" en el piloto) y no permite contratar.
 */
@UseGuards(AuthGuard('jwt'))
@Controller('suscripcion')
export class SuscripcionController {
  constructor(private readonly suscripcionService: SuscripcionService) {}

  @Get()
  async miPlan(@Req() req: any) {
    const plan = await this.suscripcionService.planActual(req.user.id);
    return { plan, limites: this.suscripcionService.limites(plan), disponible: false };
  }
}
