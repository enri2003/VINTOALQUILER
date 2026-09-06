import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Anuncio } from './anuncio.service';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly apiUrl = '';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  listar(): Observable<{ anuncioId: number; anuncio: Anuncio }[]> {
    return this.http.get<{ anuncioId: number; anuncio: Anuncio }[]>(`${this.apiUrl}/favoritos`, {
      headers: this.cabeceras(),
    });
  }

  agregar(anuncioId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/favoritos/${anuncioId}`, {}, { headers: this.cabeceras() });
  }

  quitar(anuncioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favoritos/${anuncioId}`, { headers: this.cabeceras() });
  }
}
