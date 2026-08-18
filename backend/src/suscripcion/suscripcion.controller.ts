import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Plan } from './suscripcion.entity';
import { SuscripcionService } from './suscripcion.service';

@UseGuards(AuthGuard('jwt'))
@Controller('suscripcion')
export class SuscripcionController {
  constructor(private readonly suscripcionService: SuscripcionService) {}

  @Get()
  async miPlan(@Req() req: any) {
    const plan = await this.suscripcionService.planActual(req.user.id);
    return { plan, limites: this.suscripcionService.limites(plan) };
  }

  @Post()
  contratar(@Req() req: any, @Body() datos: { plan: Plan }) {
    return this.suscripcionService.contratar(req.user.id, datos.plan);
  }
}
