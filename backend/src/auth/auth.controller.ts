import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(@Body() datos: RegistroDto) {
    return this.authService.registrar(datos);
  }

  @Post('login')
  login(@Body() datos: LoginDto) {
    return this.authService.iniciarSesion(datos.correo, datos.clave);
  }
}
