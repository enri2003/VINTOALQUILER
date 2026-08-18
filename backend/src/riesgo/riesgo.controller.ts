import { Controller, Get, Param } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';

@Controller('anuncios')
export class RiesgoController {
  constructor(private readonly riesgoService: RiesgoService) {}

  @Get(':id/riesgo')
  evaluar(@Param('id') id: string) {
    return this.riesgoService.evaluar(Number(id));
  }
}
