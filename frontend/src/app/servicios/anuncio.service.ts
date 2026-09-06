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
  enPortada?: boolean;
  estado?: string;
  publicador?: { verificado: boolean };
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

  riesgo(id: number): Observable<{ nivel: 'bajo' | 'medio' | 'alto'; senales: string[] }> {
    return this.http.get<{ nivel: 'bajo' | 'medio' | 'alto'; senales: string[] }>(
      `${this.apiUrl}/anuncios/${id}/riesgo`,
      { headers: this.cabeceras() },
    );
  }

  crear(datos: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${this.apiUrl}/anuncios`, datos, { headers: this.cabeceras() });
  }

  misAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/anuncios/mios`, { headers: this.cabeceras() });
  }

  actualizar(id: number, datos: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.patch<Anuncio>(`${this.apiUrl}/anuncios/${id}`, datos, { headers: this.cabeceras() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/anuncios/${id}`, { headers: this.cabeceras() });
  }

  subirFotos(anuncioId: number, archivos: File[]): Observable<{ url: string }[]> {
    const formulario = new FormData();
    archivos.forEach((archivo) => formulario.append('fotos', archivo));
    return this.http.post<{ url: string }[]>(`${this.apiUrl}/anuncios/${anuncioId}/fotos`, formulario, {
      headers: this.cabeceras(),
    });
  }
}
