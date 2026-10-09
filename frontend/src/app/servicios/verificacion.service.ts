import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VerificacionService {
  private readonly apiUrl = '/api';
  /** Avisa a la cabecera que la identidad quedó verificada, sin esperar a cambiar de página. */
  readonly aprobada$ = new Subject<void>();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  enviarVerificacion(
    anverso: File,
    reverso: File,
    selfie: File,
  ): Observable<{ resultado: string; similitud: number }> {
    const formData = new FormData();
    formData.append('anverso', anverso);
    formData.append('reverso', reverso);
    formData.append('selfie', selfie);
    return this.http.post<{ resultado: string; similitud: number }>(
      `${this.apiUrl}/verificacion/selfie`,
      formData,
      { headers: this.cabeceras() },
    ).pipe(tap((res) => res.resultado === 'aprobado' && this.aprobada$.next()));
  }

  estado(): Observable<{ verificado: boolean }> {
    return this.http.get<{ verificado: boolean }>(`${this.apiUrl}/verificacion/estado`, {
      headers: this.cabeceras(),
    });
  }
}
