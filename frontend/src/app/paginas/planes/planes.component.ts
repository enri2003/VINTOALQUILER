import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="planes">
      <h1>Planes</h1>
      <p>Plan actual: {{ plan }}</p>
      <div class="tarjeta">
        <h2>Gratuito</h2>
        <p class="precio">Bs. 0</p>
        <p>1 anuncio activo, 6 fotos</p>
      </div>
      <div class="tarjeta">
        <h2>Pro</h2>
        <p class="precio">Bs. 60/mes</p>
        <p>3 anuncios activos, 15 fotos</p>
        <button (click)="contratarPro()">Contratar Pro</button>
      </div>
    </section>
  `,
})
export class PlanesComponent implements OnInit {
  private readonly apiUrl = '';
  plan = 'gratuito';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  ngOnInit(): void {
    this.http
      .get<{ plan: string }>(`${this.apiUrl}/suscripcion`, { headers: this.cabeceras() })
      .subscribe((res) => (this.plan = res.plan));
  }

  contratarPro(): void {
    this.http
      .post(`${this.apiUrl}/suscripcion`, { plan: 'pro' }, { headers: this.cabeceras() })
      .subscribe(() => (this.plan = 'pro'));
  }
}
