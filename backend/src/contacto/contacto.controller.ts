import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactoService } from './contacto.service';
import { SolicitarContactoDto } from './dto/solicitar-contacto.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('contactos')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  solicitar(@Req() req: any, @Body() datos: SolicitarContactoDto) {
    return this.contactoService.solicitar(datos.anuncioId, req.user.id);
  }
}
