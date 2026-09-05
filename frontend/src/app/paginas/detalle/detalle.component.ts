import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

const ETIQUETAS_SENALES: Record<string, string> = {
  precio_atipico_para_la_zona: 'Precio fuera de lo habitual para la zona',
  cuenta_del_publicador_reciente: 'Cuenta del publicador creada hace poco',
  texto_similar_a_otro_anuncio: 'Descripción muy similar a otro anuncio',
  anuncio_con_reportes: 'Este anuncio tiene reportes de usuarios',
};

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="detalle" *ngIf="anuncio">
      <h1>{{ anuncio.titulo }}</h1>
      <p class="precio">Bs. {{ anuncio.precio }}</p>
      <p>{{ anuncio.zona?.nombre }}</p>
      <p>{{ anuncio.descripcion }}</p>

      <div class="resumen-seguridad" *ngIf="riesgo" [ngClass]="'nivel-' + riesgo.nivel">
        <h2>Resumen de seguridad</h2>
        <p class="nivel-texto">
          Nivel de riesgo: <strong>{{ riesgo.nivel }}</strong>
        </p>
        <ul *ngIf="riesgo.senales.length" class="lista-senales">
          <li *ngFor="let senal of riesgo.senales">{{ etiqueta(senal) }}</li>
        </ul>
        <p *ngIf="!riesgo.senales.length">No se detectaron señales de riesgo en este anuncio.</p>
      </div>
    </section>
  `,
  styles: [
    `
      .resumen-seguridad {
        margin-top: 24px;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid var(--borde, #E2E6EA);
      }
      .resumen-seguridad h2 {
        margin: 0 0 8px;
        font-size: 1rem;
      }
      .lista-senales {
        margin: 8px 0 0;
        padding-left: 18px;
      }
      .nivel-bajo {
        background: var(--verde-fondo, #EEF3EE);
        color: var(--verde-texto, #3F4B3F);
        border-color: var(--verde-borde, #D6E2D6);
      }
      .nivel-medio {
        background: #FBF3E3;
        color: #6B5220;
        border-color: #EAD9AE;
      }
      .nivel-alto {
        background: #F8EDED;
        color: var(--rojo, #A34848);
        border-color: var(--rojo-borde, #E2C9C9);
      }
    `,
  ],
})
export class DetalleComponent implements OnInit {
  anuncio?: Anuncio;
  riesgo?: { nivel: 'bajo' | 'medio' | 'alto'; senales: string[] };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anuncioService: AnuncioService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.anuncioService.detalle(id).subscribe((res) => (this.anuncio = res));
    this.anuncioService.riesgo(id).subscribe((res) => (this.riesgo = res));
  }

  etiqueta(senal: string): string {
    return ETIQUETAS_SENALES[senal] || senal;
  }
}
