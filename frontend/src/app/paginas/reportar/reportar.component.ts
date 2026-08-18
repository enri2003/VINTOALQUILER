import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="reportar">
      <h1>Reportar anuncio</h1>
      <form (ngSubmit)="enviar()">
        <input type="text" name="motivo" placeholder="Motivo" [(ngModel)]="motivo" required />
        <textarea name="detalle" placeholder="Detalle (opcional)" [(ngModel)]="detalle"></textarea>
        <button type="submit">Enviar reporte</button>
      </form>
      <p *ngIf="enviado">Reporte enviado.</p>
    </section>
  `,
})
export class ReportarComponent {
  private readonly apiUrl = 'http://localhost:3000';
  motivo = '';
  detalle = '';
  enviado = false;

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
  ) {}

  enviar(): void {
    const anuncioId = Number(this.route.snapshot.paramMap.get('id'));
    this.http
      .post(`${this.apiUrl}/reportes`, { anuncioId, motivo: this.motivo, detalle: this.detalle })
      .subscribe(() => (this.enviado = true));
  }
}
