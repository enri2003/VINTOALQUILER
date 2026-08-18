import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnuncioService } from './anuncio.service';
import { Anuncio, TipoAnuncio } from './anuncio.entity';
import { UsuarioService } from '../usuario/usuario.service';

function ocultarDireccion(anuncio: Anuncio, verificado: boolean) {
  if (verificado) {
    return anuncio;
  }
  const { direccionExacta, ...resto } = anuncio;
  return resto;
}

@Controller('anuncios')
export class AnuncioController {
  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @Get()
  async listar(
    @Query('zonaId') zonaId?: string,
    @Query('tipo') tipo?: TipoAnuncio,
    @Query('precioMax') precioMax?: string,
  ) {
    const anuncios = await this.anuncioService.listar({
      zonaId: zonaId ? Number(zonaId) : undefined,
      tipo,
      precioMax: precioMax ? Number(precioMax) : undefined,
    });
    return anuncios.map((anuncio) => ocultarDireccion(anuncio, false));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mios')
  misAnuncios(@Req() req: any) {
    return this.anuncioService.listarPorPublicador(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async detalle(@Param('id') id: string, @Req() req: any) {
    const anuncio = await this.anuncioService.buscarPorId(Number(id));
    const usuario = await this.usuarioService.buscarPorId(req.user?.id);
    return ocultarDireccion(anuncio, !!usuario?.verificado);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  crear(@Req() req: any, @Body() datos: Partial<Anuncio>) {
    return this.anuncioService.crear(req.user.id, datos);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  actualizar(@Param('id') id: string, @Req() req: any, @Body() datos: Partial<Anuncio>) {
    return this.anuncioService.actualizar(Number(id), req.user.id, datos);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    return this.anuncioService.eliminar(Number(id), req.user.id);
  }
}
