import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="contacto">
      <h1>Contactar al publicador</h1>
      <button class="boton-principal" (click)="solicitar()" *ngIf="!enlaceWhatsapp">
        Contactar por WhatsApp
      </button>
      <a
        *ngIf="enlaceWhatsapp"
        class="boton-principal"
        [href]="enlaceWhatsapp"
        target="_blank"
        rel="noopener"
      >
        Abrir conversacion en WhatsApp
      </a>
      <p class="mensaje-error" *ngIf="error">{{ error }}</p>
    </section>
  `,
})
export class ContactoComponent {
  private readonly apiUrl = '';
  enlaceWhatsapp = '';
  error = '';

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {}

  solicitar(): void {
    const anuncioId = Number(this.route.snapshot.paramMap.get('id'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
    this.http
      .post<{ enlaceWhatsapp: string }>(`${this.apiUrl}/contactos`, { anuncioId }, { headers })
      .subscribe({
        next: (res) => (this.enlaceWhatsapp = res.enlaceWhatsapp),
        error: () => (this.error = 'Verifica tu identidad para contactar al publicador'),
      });
  }
}
