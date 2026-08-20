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
    </section>
  `,
})
export class ObservatorioComponent implements OnInit {
  private readonly apiUrl = '';
  indicadores?: Indicadores;
  porZona: PrecioAgrupado[] = [];
  porTipo: PrecioAgrupado[] = [];

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
  }
}
