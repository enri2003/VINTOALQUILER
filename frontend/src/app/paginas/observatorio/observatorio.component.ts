import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Indicadores {
  totalAnuncios: number;
  precioPromedio: number;
}

interface PrecioAgrupado {
  zona?: string;
  tipo?: string;
  precioPromedio: string;
  totalAnuncios: string;
}

interface OfertaDemanda {
  zona: string;
  oferta: number;
  demanda: number;
}

@Component({
  selector: 'app-observatorio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="observatorio">
      <h1>Observatorio del mercado habitacional de Vinto</h1>
      <p class="precio">Bs. {{ indicadores?.precioPromedio | number: '1.0-0' }}</p>
      <p>Precio promedio sobre {{ indicadores?.totalAnuncios }} anuncios</p>

      <h2>Precio por zona</h2>
      <div *ngFor="let fila of porZona">
        <p>{{ fila.zona }}: Bs. {{ fila.precioPromedio | number: '1.0-0' }}</p>
      </div>

      <h2>Precio por tipo</h2>
      <div *ngFor="let fila of porTipo">
        <p>{{ fila.tipo }}: Bs. {{ fila.precioPromedio | number: '1.0-0' }}</p>
      </div>

      <h2>Oferta y demanda por zona</h2>
      <table class="tabla-oferta-demanda" *ngIf="ofertaDemanda.length">
        <thead>
          <tr>
            <th>Zona</th>
            <th>Oferta (anuncios activos)</th>
            <th>Demanda (favoritos + contactos)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let fila of ofertaDemanda">
            <td>{{ fila.zona }}</td>
            <td>{{ fila.oferta }}</td>
            <td>{{ fila.demanda }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      .tabla-oferta-demanda {
        border-collapse: collapse;
        margin-top: 8px;
      }
      .tabla-oferta-demanda th,
      .tabla-oferta-demanda td {
        padding: 6px 12px;
        border-bottom: 1px solid var(--borde, #E2E6EA);
        text-align: left;
      }
    `,
  ],
})
export class ObservatorioComponent implements OnInit {
  private readonly apiUrl = '';
  indicadores?: Indicadores;
  porZona: PrecioAgrupado[] = [];
  porTipo: PrecioAgrupado[] = [];
  ofertaDemanda: OfertaDemanda[] = [];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<Indicadores>(`${this.apiUrl}/observatorio/indicadores`)
      .subscribe((res) => (this.indicadores = res));
    this.http
      .get<PrecioAgrupado[]>(`${this.apiUrl}/observatorio/precio-por-zona`)
      .subscribe((res) => (this.porZona = res));
    this.http
      .get<PrecioAgrupado[]>(`${this.apiUrl}/observatorio/precio-por-tipo`)
      .subscribe((res) => (this.porTipo = res));
    this.http
      .get<OfertaDemanda[]>(`${this.apiUrl}/observatorio/oferta-demanda`)
      .subscribe((res) => (this.ofertaDemanda = res));
  }
}
