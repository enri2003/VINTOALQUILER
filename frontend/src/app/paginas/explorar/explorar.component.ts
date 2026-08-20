import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

interface Indicadores {
  totalAnuncios: number;
  precioPromedio: number;
}

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero-ancho">
      <div class="hero">
        <h1>Encuentra donde vivir en Vinto</h1>
        <p>Cuartos, garzoniers y departamentos con precio en bolivianos, ubicacion clara y publicadores verificados.</p>
        <form class="buscador" (ngSubmit)="buscar()">
          <input
            type="text"
            placeholder="Busca por zona o referencia: cerca de la UAB, plaza de Vinto..."
            [(ngModel)]="termino"
            name="termino"
          />
          <select [(ngModel)]="tipo" name="tipo">
            <option value="">Todos los tipos</option>
            <option value="cuarto">Cuarto</option>
            <option value="garzonier">Garzonier</option>
            <option value="departamento">Departamento</option>
          </select>
          <button type="submit" class="boton-principal">Buscar</button>
        </form>
      </div>
    </section>

    <section>
      <div class="grilla-estadisticas" *ngIf="indicadores as datos">
        <div class="tarjeta-estadistica">
          <p class="precio">{{ datos.totalAnuncios }}</p>
          <p>anuncios publicados en Vinto</p>
        </div>
        <div class="tarjeta-estadistica">
          <p class="precio">Bs. {{ datos.precioPromedio | number: '1.0-0' }}</p>
          <p>precio promedio del alquiler</p>
        </div>
        <div class="tarjeta-estadistica">
          <p class="precio">{{ zonasActivas }}</p>
          <p>zonas con anuncios activos</p>
        </div>
      </div>

      <div class="encabezado-seccion">
        <div>
          <h2>Anuncios disponibles</h2>
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
  private readonly apiUrl = '';
  anuncios: Anuncio[] = [];
  termino = '';
  tipo = '';
  indicadores?: Indicadores;
  zonasActivas = 0;

  constructor(
    private readonly http: HttpClient,
    private readonly anuncioService: AnuncioService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';

    this.http
      .get<Indicadores>(`${this.apiUrl}/observatorio/indicadores`)
      .subscribe((res) => (this.indicadores = res));

    this.http
      .get<{ zona: string }[]>(`${this.apiUrl}/observatorio/precio-por-zona`)
      .subscribe((res) => (this.zonasActivas = res.length));

    this.anuncioService.listar({ tipo: this.tipo || undefined }).subscribe((res) => (this.anuncios = res));
  }

  buscar(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: this.tipo || undefined },
    });
    this.anuncioService.listar({ tipo: this.tipo || undefined }).subscribe((res) => (this.anuncios = res));
  }
}
