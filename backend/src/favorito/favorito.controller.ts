import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritoService } from './favorito.service';

@UseGuards(AuthGuard('jwt'))
@Controller('favoritos')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) {}

  @Get()
  listar(@Req() req: any) {
    return this.favoritoService.listar(req.user.id);
  }

  @Post(':anuncioId')
  agregar(@Req() req: any, @Param('anuncioId') anuncioId: string) {
    return this.favoritoService.agregar(req.user.id, Number(anuncioId));
  }

  @Delete(':anuncioId')
  quitar(@Req() req: any, @Param('anuncioId') anuncioId: string) {
    return this.favoritoService.quitar(req.user.id, Number(anuncioId));
  }
}
