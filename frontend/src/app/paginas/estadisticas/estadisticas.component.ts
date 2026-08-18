import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="estadisticas">
      <h1>Estadisticas de mis anuncios</h1>
      <p>Total de anuncios: {{ anuncios.length }}</p>
    </section>
  `,
})
export class EstadisticasComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.misAnuncios().subscribe((res) => (this.anuncios = res));
  }
}
