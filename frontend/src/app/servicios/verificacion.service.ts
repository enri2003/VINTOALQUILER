import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VerificacionService {
  private readonly apiUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  enviarSelfie(documento: File, selfie: File): Observable<{ resultado: string; similitud: number }> {
    const formData = new FormData();
    formData.append('documento', documento);
    formData.append('selfie', selfie);
    return this.http.post<{ resultado: string; similitud: number }>(
      `${this.apiUrl}/verificacion/selfie`,
      formData,
      { headers: this.cabeceras() },
    );
  }

  estado(): Observable<{ verificado: boolean }> {
    return this.http.get<{ verificado: boolean }>(`${this.apiUrl}/verificacion/estado`, {
      headers: this.cabeceras(),
    });
  }
}
