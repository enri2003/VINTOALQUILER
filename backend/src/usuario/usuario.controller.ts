import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('yo')
  async yo(@Req() req: any) {
    const usuario = await this.usuarioService.buscarPorId(req.user.id);
    const { claveHash, ...datos } = usuario;
    return datos;
  }
}
