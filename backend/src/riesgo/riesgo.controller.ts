import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RiesgoService } from './riesgo.service';

@UseGuards(AuthGuard('jwt'))
@Controller('anuncios')
export class RiesgoController {
  constructor(private readonly riesgoService: RiesgoService) {}

  @Get(':id/riesgo')
  evaluar(@Param('id') id: string) {
    return this.riesgoService.evaluar(Number(id));
  }
}
