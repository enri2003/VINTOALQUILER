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
      <button (click)="solicitar()">Ver numero de contacto</button>
      <p *ngIf="celular">Celular: {{ celular }}</p>
      <p *ngIf="error">{{ error }}</p>
    </section>
  `,
})
export class ContactoComponent {
  private readonly apiUrl = '';
  celular = '';
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
      .post<{ celular: string }>(`${this.apiUrl}/contactos`, { anuncioId }, { headers })
      .subscribe({
        next: (res) => (this.celular = res.celular),
        error: () => (this.error = 'Verifica tu identidad para contactar al publicador'),
      });
  }
}
