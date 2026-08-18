import { Controller, Get } from '@nestjs/common';
import { ZonaService } from './zona.service';

@Controller('zonas')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Get()
  listar() {
    return this.zonaService.listar();
  }
}
