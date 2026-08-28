import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReporteService } from '../reporte/reporte.service';
import { UsuarioService } from '../usuario/usuario.service';
import { AnuncioService } from '../anuncio/anuncio.service';
import { ModerarAnuncioDto } from './dto/moderar-anuncio.dto';
import { CambiarActivoDto } from './dto/cambiar-activo.dto';
import { PaginacionDto } from './dto/paginacion.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly reporteService: ReporteService,
    private readonly usuarioService: UsuarioService,
    private readonly anuncioService: AnuncioService,
  ) {}

  @Get('reportes')
  reportes() {
    return this.reporteService.listarTodos();
  }

  @Patch('anuncios/:id/estado')
  moderarAnuncio(@Param('id') id: string, @Body() datos: ModerarAnuncioDto) {
    return this.anuncioService.moderarComoAdmin(Number(id), datos.estado);
  }

  @Get('usuarios')
  async usuarios(@Query() paginacion: PaginacionDto) {
    const pagina = paginacion.pagina ?? 1;
    const porPagina = paginacion.porPagina ?? 20;
    const [datos, total] = await this.usuarioService.listarTodos(pagina, porPagina);
    return { datos, total, pagina, porPagina };
  }

  @Patch('usuarios/:id/activo')
  cambiarActivo(@Param('id') id: string, @Body() datos: CambiarActivoDto) {
    return this.usuarioService.cambiarActivo(Number(id), datos.activo);
  }
}
