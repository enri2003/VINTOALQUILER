import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RolUsuario } from '../usuario/usuario.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cambiar_este_secreto',
    });
  }

  async validate(payload: { sub: number; correo: string; rol: RolUsuario }) {
    const usuario = await this.usuarioService.buscarPorId(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Cuenta suspendida o inexistente');
    }
    return { id: payload.sub, correo: payload.correo, rol: payload.rol };
  }
}
