import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecomendacionService } from './recomendacion.service';

@UseGuards(AuthGuard('jwt'))
@Controller('recomendaciones')
export class RecomendacionController {
  constructor(private readonly recomendacionService: RecomendacionService) {}

  @Get()
  recomendar(@Req() req: any) {
    return this.recomendacionService.recomendar(req.user.id);
  }
}
