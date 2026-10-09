import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Debe coincidir con MOTIVOS_REPORTE del backend (HU-11). */
const MOTIVOS = [
  'Información falsa',
  'Precio incorrecto',
  'Imagen que no corresponde',
  'Anuncio duplicado',
  'Posible estafa',
  'Inmueble ya alquilado',
  'Otro',
];

@Component({
  selector: 'app-reportar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="reportar pagina-angosta">
      <h1>Reportar anuncio</h1>

      <ng-container *ngIf="!enviado; else gracias">
        <p class="texto-suave">Cuéntanos qué problema encontraste. El administrador revisará el reporte.</p>
        <form (ngSubmit)="enviar()">
          <fieldset class="motivos">
            <legend class="etiqueta">Motivo</legend>
            <label class="opcion-motivo" *ngFor="let opcion of motivos">
              <input type="radio" name="motivo" [value]="opcion" [(ngModel)]="motivo" />
              <span>{{ opcion }}</span>
            </label>
          </fieldset>
          <label>
            <span class="etiqueta">Detalle (opcional)</span>
            <textarea name="detalle" maxlength="500" placeholder="Agrega información que ayude a revisar el anuncio" [(ngModel)]="detalle"></textarea>
          </label>
          <button type="submit" class="boton-principal" [disabled]="!motivo || enviando">
            {{ enviando ? 'Enviando...' : 'Enviar reporte' }}
          </button>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
        </form>
      </ng-container>

      <ng-template #gracias>
        <div class="reporte-enviado">
          <h2>Gracias por tu reporte</h2>
          <p>Revisaremos el anuncio y tomaremos las medidas correspondientes.</p>
          <a [routerLink]="['/anuncio', anuncioId]" class="boton-secundario">Volver al anuncio</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .motivos { border: none; padding: 0; margin: 0 0 16px; display: grid; gap: 8px; }
      .opcion-motivo {
        display: flex; align-items: center; gap: 10px; padding: 10px 12px;
        border: 1px solid var(--borde); border-radius: 12px; cursor: pointer;
      }
      .opcion-motivo:has(input:checked) { border-color: var(--acento); background: var(--superficie-alt, #F7EFE3); }
      .reporte-enviado { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
      .reporte-enviado h2, .reporte-enviado p { margin: 0; }
      textarea { width: 100%; min-height: 90px; }
    `,
  ],
})
export class ReportarComponent {
  private readonly apiUrl = '/api';
  readonly motivos = MOTIVOS;
  readonly anuncioId: number;
  motivo = '';
  detalle = '';
  enviando = false;
  enviado = false;
  error = '';

  constructor(
    private readonly http: HttpClient,
    route: ActivatedRoute,
  ) {
    this.anuncioId = Number(route.snapshot.paramMap.get('id'));
  }

  enviar(): void {
    if (!this.motivo) return;
    this.enviando = true;
    this.error = '';
    this.http
      .post(`${this.apiUrl}/reportes`, { anuncioId: this.anuncioId, motivo: this.motivo, detalle: this.detalle || undefined })
      .subscribe({
        next: () => {
          this.enviando = false;
          this.enviado = true;
        },
        error: (err) => {
          this.enviando = false;
          this.error = err?.error?.message || 'No se pudo enviar el reporte. Intenta de nuevo.';
        },
      });
  }
}
