import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';
import { FavoritoService } from '../../servicios/favorito.service';
import { AuthService } from '../../servicios/auth.service';

const ETIQUETAS_SENALES: Record<string, string> = {
  precio_atipico_para_la_zona: 'Precio fuera de lo habitual para la zona',
  cuenta_del_publicador_reciente: 'Cuenta del publicador creada hace poco',
  texto_similar_a_otro_anuncio: 'Descripción muy similar a otro anuncio',
  anuncio_con_reportes: 'Este anuncio tiene reportes de usuarios',
};

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="detalle" *ngIf="anuncio">
      <h1>{{ anuncio.titulo }}</h1>
      <p class="precio">Bs. {{ anuncio.precio }}</p>
      <p>{{ anuncio.zona?.nombre }}</p>
      <p>{{ anuncio.descripcion }}</p>

      <div class="acciones" *ngIf="authService.esInteresado()">
        <button class="boton-secundario" (click)="alternarFavorito()">
          {{ esFavorito ? '♥ Quitar de favoritos' : '♡ Guardar en favoritos' }}
        </button>
        <a class="boton-secundario" [routerLink]="['/anuncio', anuncio.id, 'contacto']">Contactar publicador</a>
      </div>
      <p class="mensaje-error" *ngIf="errorFavorito">{{ errorFavorito }}</p>
      <a class="enlace-reportar" [routerLink]="['/anuncio', anuncio.id, 'reportar']">Reportar este anuncio</a>

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
      .acciones {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      .enlace-reportar {
        display: inline-block;
        margin-top: 12px;
        font-size: 0.85rem;
        color: var(--rojo, #A34848);
      }
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
  esFavorito = false;
  errorFavorito = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anuncioService: AnuncioService,
    private readonly favoritoService: FavoritoService,
    readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.anuncioService.detalle(id).subscribe((res) => (this.anuncio = res));
    this.anuncioService.riesgo(id).subscribe((res) => (this.riesgo = res));

    if (this.authService.esInteresado()) {
      this.favoritoService
        .listar()
        .subscribe((res) => (this.esFavorito = res.some((favorito) => favorito.anuncioId === id)));
    }
  }

  alternarFavorito(): void {
    if (!this.anuncio) return;
    this.errorFavorito = '';
    const id = this.anuncio.id;
    if (this.esFavorito) {
      this.favoritoService.quitar(id).subscribe({
        next: () => (this.esFavorito = false),
        error: (err) => (this.errorFavorito = err?.error?.message || 'No se pudo quitar de favoritos.'),
      });
    } else {
      this.favoritoService.agregar(id).subscribe({
        next: () => (this.esFavorito = true),
        error: (err) => (this.errorFavorito = err?.error?.message || 'No se pudo guardar en favoritos.'),
      });
    }
  }

  etiqueta(senal: string): string {
    return ETIQUETAS_SENALES[senal] || senal;
  }
}
