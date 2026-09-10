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
      <p class="texto-suave">Segun las zonas y tipos de alquiler que has visto o guardado.</p>

      <div class="grilla" *ngIf="anuncios.length; else sinRecomendados">
        <a *ngFor="let anuncio of anuncios" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta">
          <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
          <div class="fila-tarjeta">
            <p class="precio">Bs. {{ anuncio.precio }}</p>
            <span class="chip">{{ anuncio.tipo }}</span>
          </div>
          <h2>{{ anuncio.titulo }}</h2>
          <p class="texto-suave">{{ anuncio.zona?.nombre }}</p>
        </a>
      </div>
      <ng-template #sinRecomendados>
        <p class="texto-suave">Aun no tenemos recomendaciones para ti. Explora algunos anuncios primero.</p>
      </ng-template>
    </section>
  `,
})
export class RecomendadosComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.recomendados().subscribe((res) => (this.anuncios = res));
  }
}
