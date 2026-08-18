import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="explorar">
      <h1>Anuncios disponibles</h1>
      <div class="grilla">
        <a *ngFor="let anuncio of anuncios" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta">
          <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
          <h2>{{ anuncio.titulo }}</h2>
          <p>{{ anuncio.zona?.nombre }}</p>
          <p class="precio">Bs. {{ anuncio.precio }}</p>
        </a>
      </div>
    </section>
  `,
})
export class ExplorarComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.listar().subscribe((res) => (this.anuncios = res));
  }
}
