import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';
import { FavoritoService } from '../../servicios/favorito.service';
import { AuthService } from '../../servicios/auth.service';
import { clasificarServicios } from '../../utilidades/catalogo-anuncio';

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
      <a routerLink="/mapa" class="enlace-volver">← Volver al mapa</a>

      <div class="galeria" *ngIf="anuncio.fotos?.length">
        <img
          *ngFor="let foto of anuncio.fotos; let i = index"
          [src]="foto.url"
          [alt]="'Foto ' + (i + 1) + ' de ' + anuncio.fotos.length + ': ' + anuncio.titulo"
        />
      </div>

      <h1>{{ anuncio.titulo }}</h1>
      <span class="insignia-estado-publicador" [class.insignia-estado-verificado]="anuncio.publicador?.verificado">
        {{ anuncio.publicador?.verificado ? '✓ Publicador verificado' : 'Publicador no verificado' }}
      </span>
      <p class="precio">Bs. {{ anuncio.precio | number: '1.0-0' }}/mes</p>
      <p class="texto-suave fila-ubicacion">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-pin" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
        {{ anuncio.referencia }} · {{ anuncio.zona?.nombre }}
      </p>
      <p *ngIf="anuncio.direccionExacta" class="texto-suave">Dirección exacta: {{ anuncio.direccionExacta }}</p>
      <p *ngIf="!anuncio.direccionExacta" class="texto-suave nota-privacidad">
        Ubicación aproximada por privacidad. La dirección exacta solo es visible para interesados con identidad verificada.
      </p>

      <div class="acciones">
        <ng-container *ngIf="authService.esInteresado()">
          <a class="boton-principal" [routerLink]="['/anuncio', anuncio.id, 'contacto']">Contactar al publicador</a>
          <button class="boton-secundario" (click)="alternarFavorito()">
            {{ esFavorito ? '♥ Quitar de favoritos' : '♡ Guardar en favoritos' }}
          </button>
        </ng-container>
      </div>
      <p class="mensaje-error" *ngIf="errorFavorito">{{ errorFavorito }}</p>

      <p class="descripcion">{{ anuncio.descripcion }}</p>

      <h2 class="titulo-seccion">Características</h2>
      <div class="detalles-tecnicos">
        <span class="chip">{{ anuncio.tipo }}</span>
        <span class="chip" *ngIf="anuncio.ambientes">{{ anuncio.ambientes }} {{ anuncio.ambientes === 1 ? 'ambiente' : 'ambientes' }}</span>
        <span class="chip" *ngIf="anuncio.superficieM2">{{ anuncio.superficieM2 }} m²</span>
      </div>

      <ng-container *ngIf="servicios as s">
        <div class="grupo-detalle" *ngIf="s.incluidos.length">
          <strong>Servicios incluidos en el precio</strong>
          <div class="detalles-tecnicos"><span class="chip chip-incluido" *ngFor="let item of s.incluidos">✓ {{ item }}</span></div>
        </div>
        <div class="grupo-detalle" *ngIf="s.aparte.length">
          <strong>Se pagan por separado</strong>
          <div class="detalles-tecnicos"><span class="chip" *ngFor="let item of s.aparte">{{ item }}</span></div>
        </div>
        <div class="grupo-detalle" *ngIf="s.caracteristicas.length">
          <strong>Características</strong>
          <div class="detalles-tecnicos"><span class="chip" *ngFor="let item of s.caracteristicas">{{ item }}</span></div>
        </div>
      </ng-container>

      <div class="condiciones">
        <p *ngIf="anuncio.garantia"><strong>Garantía:</strong> {{ anuncio.garantia }}</p>
        <p *ngIf="anuncio.contratoMinimo"><strong>Tiempo mínimo de alquiler:</strong> {{ anuncio.contratoMinimo }}</p>
      </div>

      <div class="resumen-seguridad" *ngIf="riesgo" [ngClass]="'nivel-' + riesgo.nivel">
        <h2>Evaluación automática de seguridad</h2>
        <p class="nivel-texto">
          Nivel de riesgo estimado: <strong>{{ riesgo.nivel }}</strong>
        </p>
        <ul *ngIf="riesgo.senales.length" class="lista-senales">
          <li *ngFor="let senal of riesgo.senales">{{ etiqueta(senal) }}</li>
        </ul>
        <p *ngIf="!riesgo.senales.length">No se identificaron señales de riesgo según los datos disponibles.</p>
        <p class="nota-referencial">
          Esta evaluación es referencial y no reemplaza la visita al inmueble ni la revisión del contrato y del publicador.
        </p>
      </div>

      <a class="enlace-reportar" [routerLink]="['/anuncio', anuncio.id, 'reportar']">Reportar este anuncio</a>
    </section>
  `,
  styles: [
    `
      .galeria {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        margin-bottom: 16px;
      }
      .galeria img {
        height: 220px;
        width: auto;
        border-radius: 12px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .insignia-estado-publicador {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #F3EEDD;
        color: #7A5E1F;
        font: 700 11.5px 'Manrope', sans-serif;
        padding: 4px 10px;
        border-radius: 999px;
        margin-bottom: 8px;
      }
      .insignia-estado-verificado {
        background: #3E8E5B;
        color: #fff;
      }
      .detalles-tecnicos {
        display: flex;
        gap: 8px;
        margin: 12px 0;
        flex-wrap: wrap;
      }
      .grupo-detalle { margin: 12px 0; font-size: 0.9rem; }
      .grupo-detalle .detalles-tecnicos { margin: 6px 0 0; }
      .chip-incluido { border-color: #9CCBA9; color: #1F6B3A; }
      .condiciones p {
        margin: 4px 0;
      }
      .detalle { max-width: 860px; margin: 0 auto; padding: 24px 20px 60px; }
      .enlace-volver { display: inline-block; margin-bottom: 14px; font-weight: 600; color: var(--acento-oscuro); text-decoration: none; }
      .nota-privacidad { font-size: 13px; }
      .descripcion { line-height: 1.6; margin: 20px 0; }
      .titulo-seccion { font-size: 17px; margin: 20px 0 4px; }
      .nota-referencial { font-size: 12.5px; margin: 10px 0 0; opacity: 0.85; }
      .acciones {
        display: flex;
        flex-wrap: wrap;
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

  get servicios() {
    return clasificarServicios(this.anuncio?.servicios);
  }

  etiqueta(senal: string): string {
    return ETIQUETAS_SENALES[senal] || senal;
  }
}
