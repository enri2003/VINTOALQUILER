import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
