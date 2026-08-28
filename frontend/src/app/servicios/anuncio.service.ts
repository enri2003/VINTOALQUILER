import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface Anuncio {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  precio: number;
  zona: { id: number; nombre: string };
  fotos: { url: string }[];
  creadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class AnuncioService {
  private readonly apiUrl = '';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  listar(
    filtros: { zonaId?: number; tipo?: string; precioMax?: number; pagina?: number; porPagina?: number } = {},
  ): Observable<Anuncio[]> {
    const params: string[] = [];
    if (filtros.zonaId) params.push(`zonaId=${filtros.zonaId}`);
    if (filtros.tipo) params.push(`tipo=${filtros.tipo}`);
    if (filtros.precioMax) params.push(`precioMax=${filtros.precioMax}`);
    if (filtros.pagina) params.push(`pagina=${filtros.pagina}`);
    if (filtros.porPagina) params.push(`porPagina=${filtros.porPagina}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http
      .get<{ datos: Anuncio[]; total: number }>(`${this.apiUrl}/anuncios${query}`)
      .pipe(map((res) => res.datos));
  }

  detalle(id: number): Observable<Anuncio> {
    return this.http.get<Anuncio>(`${this.apiUrl}/anuncios/${id}`, { headers: this.cabeceras() });
  }

  crear(datos: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${this.apiUrl}/anuncios`, datos, { headers: this.cabeceras() });
  }

  misAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/anuncios/mios`, { headers: this.cabeceras() });
  }
}
