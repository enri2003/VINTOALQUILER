import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <div class="encabezado-seccion">
        <div>
          <h1>Anuncios disponibles</h1>
          <p class="subtitulo">{{ anuncios.length }} resultados en Vinto</p>
        </div>
      </div>
      <div class="grilla" *ngIf="anuncios.length; else sinResultados">
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
      <ng-template #sinResultados>
        <p class="texto-suave">No hay anuncios que coincidan con la busqueda.</p>
      </ng-template>
    </section>
  `,
})
export class ExplorarComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const tipo = this.route.snapshot.queryParamMap.get('tipo') || undefined;
    this.anuncioService.listar({ tipo }).subscribe((res) => (this.anuncios = res));
  }
}
