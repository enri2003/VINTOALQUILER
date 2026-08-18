import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

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
    </section>
  `,
})
export class DetalleComponent implements OnInit {
  anuncio?: Anuncio;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anuncioService: AnuncioService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.anuncioService.detalle(id).subscribe((res) => (this.anuncio = res));
  }
}
