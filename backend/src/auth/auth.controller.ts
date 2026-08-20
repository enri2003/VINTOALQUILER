import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(
    @Body()
    datos: {
      nombre: string;
      correo: string;
      clave: string;
      celular: string;
      rol: 'interesado' | 'publicador';
      perfilHogar?: string;
    },
  ) {
    return this.authService.registrar(datos);
  }

  @Post('login')
  login(@Body() datos: { correo: string; clave: string }) {
    return this.authService.iniciarSesion(datos.correo, datos.clave);
  }
}
