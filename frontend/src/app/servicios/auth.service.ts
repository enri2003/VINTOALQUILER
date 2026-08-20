import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

interface RespuestaToken {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '';

  constructor(private readonly http: HttpClient) {}

  registrar(datos: {
    nombre: string;
    correo: string;
    clave: string;
    celular: string;
    rol: 'interesado' | 'publicador';
  }): Observable<RespuestaToken> {
    return this.http
      .post<RespuestaToken>(`${this.apiUrl}/auth/registro`, datos)
      .pipe(tap((res) => this.guardarToken(res.accessToken)));
  }

  iniciarSesion(correo: string, clave: string): Observable<RespuestaToken> {
    return this.http
      .post<RespuestaToken>(`${this.apiUrl}/auth/login`, { correo, clave })
      .pipe(tap((res) => this.guardarToken(res.accessToken)));
  }

  cerrarSesion(): void {
    localStorage.removeItem('accessToken');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private guardarToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }
}
