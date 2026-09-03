import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PlanImpulsoInfo {
  dias: number;
  precio: number;
  fotosMax: number;
  portada: boolean;
}

export interface Impulso {
  id: number;
  plan: number;
  precio: number;
  estado: 'pendiente' | 'activo' | 'rechazado' | 'vencido';
  motivoRechazo?: string;
  creadoEn: string;
  anuncio: { id: number; titulo: string };
}

@Injectable({ providedIn: 'root' })
export class ImpulsoService {
  private readonly apiUrl = '';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  planes(): Observable<Record<string, PlanImpulsoInfo>> {
    return this.http.get<Record<string, PlanImpulsoInfo>>(`${this.apiUrl}/impulsos/planes`);
  }

  solicitar(anuncioId: number, plan: number, comprobante: File): Observable<Impulso> {
    const formulario = new FormData();
    formulario.append('anuncioId', String(anuncioId));
    formulario.append('plan', String(plan));
    formulario.append('comprobante', comprobante);
    return this.http.post<Impulso>(`${this.apiUrl}/impulsos`, formulario, { headers: this.cabeceras() });
  }

  misImpulsos(): Observable<Impulso[]> {
    return this.http.get<Impulso[]>(`${this.apiUrl}/impulsos/mios`, { headers: this.cabeceras() });
  }
}
