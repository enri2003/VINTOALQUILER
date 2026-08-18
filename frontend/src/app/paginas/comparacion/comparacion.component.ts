import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-comparacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="comparacion">
      <h1>Comparar anuncios</h1>
      <table>
        <thead>
          <tr>
            <th>Anuncio</th>
            <th>Precio</th>
            <th>Zona</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let anuncio of anuncios">
            <td>{{ anuncio.titulo }}</td>
            <td>Bs. {{ anuncio.precio }}</td>
            <td>{{ anuncio.zona?.nombre }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
})
export class ComparacionComponent {
  anuncios: Anuncio[] = [];

  constructor(private readonly anuncioService: AnuncioService) {}
}
