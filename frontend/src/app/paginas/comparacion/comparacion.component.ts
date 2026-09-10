import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-comparacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="comparacion">
      <h1>Comparar anuncios</h1>
      <table *ngIf="anuncios.length; else sinAnuncios">
        <thead>
          <tr>
            <th></th>
            <th *ngFor="let anuncio of anuncios">{{ anuncio.titulo }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Precio</td>
            <td *ngFor="let anuncio of anuncios">Bs. {{ anuncio.precio }}</td>
          </tr>
          <tr>
            <td>Tipo</td>
            <td *ngFor="let anuncio of anuncios">{{ anuncio.tipo }}</td>
          </tr>
          <tr>
            <td>Zona</td>
            <td *ngFor="let anuncio of anuncios">{{ anuncio.zona?.nombre }}</td>
          </tr>
          <tr>
            <td>Verificado</td>
            <td *ngFor="let anuncio of anuncios">{{ anuncio.publicador?.verificado ? 'Si' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #sinAnuncios>
        <p class="texto-suave">
          Selecciona 2 o mas anuncios desde tus favoritos para compararlos aqui.
        </p>
      </ng-template>
    </section>
  `,
})
export class ComparacionComponent implements OnInit {
  anuncios: Anuncio[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anuncioService: AnuncioService,
  ) {}

  ngOnInit(): void {
    const idsParam = this.route.snapshot.queryParamMap.get('ids');
    if (!idsParam) return;
    const ids = idsParam
      .split(',')
      .map(Number)
      .filter((id) => !Number.isNaN(id));
    if (!ids.length) return;

    forkJoin(ids.map((id) => this.anuncioService.detalle(id))).subscribe((res) => (this.anuncios = res));
  }
}
