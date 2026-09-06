import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ImpulsoService, PLANES_IMPULSO } from './impulso.service';
import { CrearImpulsoDto } from './dto/crear-impulso.dto';
import { RechazarImpulsoDto } from './dto/rechazar-impulso.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('impulsos')
export class ImpulsoController {
  constructor(private readonly impulsoService: ImpulsoService) {}

  @Get('planes')
  planes() {
    return PLANES_IMPULSO;
  }

  @Get('accion')
  async accionPorCorreo(@Query('token') token: string, @Res() res: Response) {
    try {
      const resultado = await this.impulsoService.ejecutarAccionPorToken(token);
      res.status(200).send(paginaResultado(resultado.mensaje, true));
    } catch (error: any) {
      res.status(400).send(paginaResultado(error.message || 'No se pudo procesar la accion.', false));
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('comprobante'))
  solicitar(@Req() req: any, @Body() datos: CrearImpulsoDto, @UploadedFile() comprobante: Express.Multer.File) {
    if (!comprobante) {
      throw new BadRequestException('Debes adjuntar el comprobante de pago');
    }
    return this.impulsoService.solicitar(datos.anuncioId, req.user.id, datos.plan, comprobante);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mios')
  misImpulsos(@Req() req: any) {
    return this.impulsoService.listarMios(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('pendientes')
  pendientes() {
    return this.impulsoService.listarPendientes();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('activos')
  activos() {
    return this.impulsoService.listarActivos();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/activar')
  activar(@Param('id') id: string) {
    return this.impulsoService.activar(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string, @Body() datos: RechazarImpulsoDto) {
    return this.impulsoService.rechazar(Number(id), datos.motivo);
  }
}

function paginaResultado(mensaje: string, exito: boolean): string {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<title>VintoAlquiler</title>
<style>body{font-family:sans-serif;background:#FBF1E3;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
.tarjeta{background:#fff;padding:32px;border-radius:16px;max-width:420px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.08);}
.icono{font-size:40px;}</style></head>
<body><div class="tarjeta"><div class="icono">${exito ? '✅' : '⚠️'}</div><p>${mensaje}</p></div></body></html>`;
}
