import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Como AuthGuard('jwt'), pero sin exigir sesión: si la petición trae un token válido deja el usuario en
 * req.user; si no trae token (o no es válido), la petición sigue como visitante con req.user = null.
 * Se usa en rutas públicas que muestran más datos a ciertos usuarios (ej. la ubicación exacta).
 */
@Injectable()
export class JwtOpcionalGuard extends AuthGuard('jwt') {
  handleRequest<T>(_error: unknown, usuario: T): T | null {
    return usuario || null;
  }
}
