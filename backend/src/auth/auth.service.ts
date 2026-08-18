import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { RolUsuario } from '../usuario/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: {
    nombre: string;
    correo: string;
    clave: string;
    celular: string;
    rol: RolUsuario;
  }) {
    const existente = await this.usuarioService.buscarPorCorreo(datos.correo);
    if (existente) {
      throw new BadRequestException('El correo ya esta registrado');
    }
    const claveHash = await bcrypt.hash(datos.clave, 10);
    const usuario = await this.usuarioService.crear({
      nombre: datos.nombre,
      correo: datos.correo,
      claveHash,
      celular: datos.celular,
      rol: datos.rol,
    });
    return this.generarToken(usuario.id, usuario.correo);
  }

  async iniciarSesion(correo: string, clave: string) {
    const usuario = await this.usuarioService.buscarPorCorreo(correo);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    const claveValida = await bcrypt.compare(clave, usuario.claveHash);
    if (!claveValida) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return this.generarToken(usuario.id, usuario.correo);
  }

  private generarToken(id: number, correo: string) {
    const accessToken = this.jwtService.sign({ sub: id, correo });
    return { accessToken };
  }
}
