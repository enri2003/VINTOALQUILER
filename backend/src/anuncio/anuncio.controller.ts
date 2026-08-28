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
import { Anuncio } from './anuncio.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { CrearAnuncioDto } from './dto/crear-anuncio.dto';
import { ActualizarAnuncioDto } from './dto/actualizar-anuncio.dto';
import { ListarAnunciosDto } from './dto/listar-anuncios.dto';

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
  async listar(@Query() filtros: ListarAnunciosDto) {
    const resultado = await this.anuncioService.listar(filtros);
    return {
      ...resultado,
      datos: resultado.datos.map((anuncio) => ocultarDireccion(anuncio, false)),
    };
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
  crear(@Req() req: any, @Body() datos: CrearAnuncioDto) {
    return this.anuncioService.crear(req.user.id, datos);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  actualizar(@Param('id') id: string, @Req() req: any, @Body() datos: ActualizarAnuncioDto) {
    return this.anuncioService.actualizar(Number(id), req.user.id, datos);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    return this.anuncioService.eliminar(Number(id), req.user.id);
  }
}
