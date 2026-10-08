import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-recomendados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="recomendados">
      <h1>Recomendados para ti</h1>
      <p class="texto-suave">
        Recomendaciones basadas en tus zonas, tipos de inmueble y rangos de precio consultados o guardados.
      </p>
      <p class="nota-inicial" *ngIf="anuncios.length && esInicial">
        Estas recomendaciones son iniciales. Se ajustarán cuando consultes o guardes más anuncios.
      </p>

      <div class="grilla" *ngIf="anuncios.length; else sinRecomendaciones">
        <div *ngFor="let anuncio of anuncios" class="tarjeta">
          <a [routerLink]="['/anuncio', anuncio.id]">
            <div class="contenedor-imagen">
              <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" [alt]="anuncio.titulo" (error)="$any($event.target).hidden = true" />
              <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Verificado</span>
              <span class="insignia-pendiente" *ngIf="anuncio.publicador && !anuncio.publicador.verificado">Publicador no verificado</span>
            </div>
            <div class="fila-tarjeta">
              <p class="precio">Bs. {{ anuncio.precio | number: '1.0-0' }} <span class="por-mes">/mes</span></p>
              <span class="chip">{{ anuncio.tipo }}</span>
            </div>
            <h2>{{ anuncio.titulo }}</h2>
            <p class="texto-suave">{{ anuncio.zona?.nombre }}</p>
          </a>
          <a class="boton-secundario ver-anuncio" [routerLink]="['/anuncio', anuncio.id]">Ver anuncio</a>
        </div>
      </div>

      <ng-template #sinRecomendaciones>
        <div class="estado-vacio">
          <span class="icono-vacio">♡</span>
          <h2>Todavía no tenemos recomendaciones para ti</h2>
          <p class="texto-suave">Explora algunos anuncios o guarda tus favoritos para que podamos mostrarte opciones más adecuadas.</p>
          <a class="boton-principal" routerLink="/explorar">Explorar alquileres</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .recomendados { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
      .nota-inicial {
        background: var(--superficie-alt, #F7EFE3);
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        margin: 12px 0 0;
      }
      .ver-anuncio { display: block; text-align: center; margin-top: 10px; }
      .estado-vacio {
        max-width: 440px;
        margin: 48px auto 0;
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 18px;
        padding: 36px 28px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .icono-vacio { font-size: 42px; color: var(--acento); line-height: 1; }
      .estado-vacio h2 { margin: 0; font-size: 20px; }
      .estado-vacio p { margin: 0 0 8px; }
    `,
  ],
})
export class RecomendadosComponent implements OnInit {
  anuncios: Anuncio[] = [];
  esInicial = true;

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.recomendados().subscribe((res) => (this.anuncios = res));
  }
}
