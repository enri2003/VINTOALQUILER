import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertaService } from './alerta.service';
import { CrearAlertaDto } from './dto/crear-alerta.dto';
import { ActualizarAlertaDto } from './dto/actualizar-alerta.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('alertas')
export class AlertaController {
  constructor(private readonly alertaService: AlertaService) {}

  @Get()
  listar(@Req() req: any) {
    return this.alertaService.listar(req.user.id);
  }

  @Post()
  crear(@Req() req: any, @Body() datos: CrearAlertaDto) {
    return this.alertaService.crear(req.user.id, datos);
  }

  @Patch(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() datos: ActualizarAlertaDto) {
    return this.alertaService.actualizar(Number(id), req.user.id, datos);
  }
}
