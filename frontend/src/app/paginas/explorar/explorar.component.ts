import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';

interface Zona {
  id: number;
  nombre: string;
  latitud?: number;
  longitud?: number;
}

const CENTRO_VINTO: [number, number] = [-66.317, -17.397];
const ICONO_CASA =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>';

const ESTILO_OSM_CLARO: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; colaboradores de OpenStreetMap',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: { 'raster-saturation': -0.6, 'raster-brightness-min': 0.35 },
    },
  ],
};

const RANGOS_PRECIO = [
  { etiqueta: 'Hasta Bs. 1.000', valor: 1000 },
  { etiqueta: 'Hasta Bs. 2.000', valor: 2000 },
  { etiqueta: 'Hasta Bs. 3.000', valor: 3000 },
];

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero-ancho hero-portada">
      <div class="hero hero-izquierda">
        <h1>Alquileres en Vinto</h1>
        <p>Encuentra tu proximo hogar en Vinto, Bolivia</p>

        <form class="buscador" (ngSubmit)="buscar()">
          <div class="segmento-buscador">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento">
              <path d="M12 2 20 10v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z" />
              <path d="M2 10 12 2l10 8" />
            </svg>
            <div class="texto-segmento">
              <span class="etiqueta-segmento">Tipo</span>
              <select [(ngModel)]="tipo" name="tipo">
                <option value="">Todos los tipos</option>
                <option value="cuarto">Cuarto</option>
                <option value="garzonier">Garzonier</option>
                <option value="departamento">Departamento</option>
              </select>
            </div>
          </div>
          <div class="segmento-buscador">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div class="texto-segmento">
              <span class="etiqueta-segmento">Zona</span>
              <select [(ngModel)]="zonaId" name="zonaId">
                <option [ngValue]="null">Todas las zonas</option>
                <option *ngFor="let zona of zonas" [ngValue]="zona.id">{{ zona.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="segmento-buscador">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento">
              <path d="M12 2 20 10v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z" />
              <path d="M2 10 12 2l10 8" />
              <path d="M9 15h6" />
            </svg>
            <div class="texto-segmento">
              <span class="etiqueta-segmento">Precio en Bs</span>
              <select [(ngModel)]="precioMax" name="precioMax">
                <option [ngValue]="null">Rango de precio</option>
                <option *ngFor="let rango of rangosPrecio" [ngValue]="rango.valor">{{ rango.etiqueta }}</option>
              </select>
            </div>
          </div>
          <button type="submit" class="boton-principal boton-buscar">
            Buscar
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>
      </div>
    </section>

    <section>
      <ng-container *ngIf="destacados.length">
        <div class="encabezado-seccion">
          <div>
            <h2>Destacados ⭐</h2>
          </div>
        </div>
        <div class="grilla">
          <a *ngFor="let anuncio of destacados" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta">
            <div class="contenedor-imagen">
              <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
              <span class="insignia-destacado">DESTACADO</span>
              <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Verificado</span>
            </div>
            <h2>{{ anuncio.titulo }}</h2>
            <p class="texto-suave fila-ubicacion">📍 {{ anuncio.zona?.nombre }}</p>
            <div class="fila-tarjeta">
              <p class="precio">Bs {{ anuncio.precio | number: '1.0-0' }} <span class="por-mes">/mes</span></p>
              <span class="chip">{{ anuncio.tipo }}</span>
            </div>
          </a>
        </div>
      </ng-container>

      <div class="encabezado-seccion">
        <div>
          <h2>En el mapa 📍</h2>
          <p class="subtitulo">Explora alquileres cerca de ti en Vinto y sus zonas.</p>
        </div>
        <a routerLink="/mapa">Ver todos los avisos →</a>
      </div>
      <div id="mapa-portada" class="mapa-portada"></div>

      <div class="encabezado-seccion">
        <div>
          <h2>Más avisos</h2>
          <p class="subtitulo">{{ anuncios.length }} resultados en Vinto</p>
        </div>
      </div>

      <div class="grilla" *ngIf="anuncios.length; else sinResultados">
        <a *ngFor="let anuncio of anuncios" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta">
          <div class="contenedor-imagen">
            <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
            <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Verificado</span>
          </div>
          <h2>{{ anuncio.titulo }}</h2>
          <p class="texto-suave fila-ubicacion">📍 {{ anuncio.zona?.nombre }}</p>
          <div class="fila-tarjeta">
            <p class="precio">Bs {{ anuncio.precio | number: '1.0-0' }} <span class="por-mes">/mes</span></p>
            <span class="chip">{{ anuncio.tipo }}</span>
          </div>
        </a>
      </div>
      <ng-template #sinResultados>
        <p class="texto-suave">No hay anuncios que coincidan con la busqueda.</p>
      </ng-template>
    </section>
  `,
})
export class ExplorarComponent implements OnInit, AfterViewInit {
  private readonly apiUrl = '';
  private mapa?: maplibregl.Map;
  private mapaListo = false;
  private marcadores: maplibregl.Marker[] = [];
  anuncios: Anuncio[] = [];
  destacados: Anuncio[] = [];
  zonas: Zona[] = [];
  rangosPrecio = RANGOS_PRECIO;
  termino = '';
  tipo = '';
  zonaId: number | null = null;
  precioMax: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly anuncioService: AnuncioService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';

    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => (this.zonas = res));

    this.cargarAnuncios();
  }

  ngAfterViewInit(): void {
    this.mapa = new maplibregl.Map({
      container: 'mapa-portada',
      style: ESTILO_OSM_CLARO,
      center: CENTRO_VINTO,
      zoom: 14,
      attributionControl: false,
    });
    this.mapa.on('load', () => {
      this.mapaListo = true;
      this.pintarMarcadores();
    });
  }

  private pintarMarcadores(): void {
    if (!this.mapa || !this.mapaListo) return;
    this.marcadores.forEach((marcador) => marcador.remove());
    this.marcadores = [];
    this.anuncios.forEach((anuncio) => {
      const zona = anuncio.zona as Zona;
      if (zona?.latitud && zona?.longitud) {
        const elemento = document.createElement('div');
        elemento.className = 'pin-anuncio';
        elemento.innerHTML = ICONO_CASA;
        elemento.addEventListener('click', () => this.router.navigate(['/anuncio', anuncio.id]));

        const verificado = anuncio.publicador?.verificado;
        const marcador = new maplibregl.Marker({ element: elemento })
          .setLngLat([zona.longitud, zona.latitud])
          .setPopup(
            new maplibregl.Popup({ offset: 24 }).setHTML(
              `<strong>${anuncio.titulo}</strong><br/>${anuncio.tipo.charAt(0).toUpperCase() + anuncio.tipo.slice(1)} · Bs ${anuncio.precio}/mes${verificado ? ' · <span style="color:#3E8E5B">✓ Verificado</span>' : ''}`,
            ),
          )
          .addTo(this.mapa!);
        this.marcadores.push(marcador);
      }
    });
  }

  private cargarAnuncios(): void {
    this.anuncioService
      .listar({
        tipo: this.tipo || undefined,
        zonaId: this.zonaId || undefined,
        precioMax: this.precioMax || undefined,
      })
      .subscribe((res) => {
        this.anuncios = res;
        this.destacados = res.filter((anuncio) => anuncio.enPortada);
        this.pintarMarcadores();
      });
  }

  buscar(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: this.tipo || undefined },
    });
    this.cargarAnuncios();
  }
}
