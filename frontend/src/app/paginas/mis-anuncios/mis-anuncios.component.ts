import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-mis-anuncios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mis-anuncios">
      <h1>Mis anuncios</h1>
      <div *ngFor="let anuncio of anuncios" class="tarjeta">
        <h2>{{ anuncio.titulo }}</h2>
        <p class="precio">Bs. {{ anuncio.precio }}</p>
      </div>
    </section>
  `,
})
export class MisAnunciosComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.misAnuncios().subscribe((res) => (this.anuncios = res));
  }
}
