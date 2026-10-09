import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';
import { dispersarCoordenada } from '../../utilidades/coordenadas.util';
import { crearAccionesMapa, crearMarcadorAnuncio } from '../../utilidades/mapa-popup.util';
import { AuthService } from '../../servicios/auth.service';
import { FavoritoService } from '../../servicios/favorito.service';
import { obtenerSelloImpulso } from '../../utilidades/sello-impulso.util';
import { OpcionSelector, SelectorBuscadorComponent } from '../../componentes/selector-buscador.component';

interface Zona {
  id: number;
  nombre: string;
  latitud?: number;
  longitud?: number;
}

const CENTRO_VINTO: [number, number] = [-66.317, -17.397];

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
  imports: [CommonModule, FormsModule, RouterLink, SelectorBuscadorComponent],
  template: `
    <section class="hero-ancho hero-portada">
      <div class="hero hero-izquierda">
        <h1>Alquileres en Vinto</h1>
        <p>Encuentra tu próximo hogar cerca de la UAB y del centro de Vinto.</p>

        <form class="buscador" (ngSubmit)="buscar()">
          <app-selector-buscador etiqueta="Tipo" [opciones]="opcionesTipo" [(valor)]="tipo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento" aria-hidden="true">
              <path d="M12 2 20 10v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z" />
              <path d="M2 10 12 2l10 8" />
            </svg>
          </app-selector-buscador>
          <app-selector-buscador etiqueta="Zona" [opciones]="opcionesZona" [(valor)]="zonaId">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </app-selector-buscador>
          <app-selector-buscador etiqueta="Precio mensual" [opciones]="opcionesPrecio" [(valor)]="precioMax">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-segmento" aria-hidden="true">
              <path d="M12 2 20 10v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z" />
              <path d="M2 10 12 2l10 8" />
              <path d="M9 15h6" />
            </svg>
          </app-selector-buscador>
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
            <h2>{{ destacados.length === 1 ? 'Anuncio destacado' : 'Destacados' }}</h2>
            <p class="subtitulo">
              {{ destacados.length === 1 ? 'Hay 1 anuncio destacado actualmente.' : 'Hay ' + destacados.length + ' anuncios destacados actualmente.' }}
            </p>
          </div>
        </div>
        <div class="carrusel-destacados" [class.carrusel-unico]="destacados.length === 1">
          <a *ngFor="let anuncio of destacados" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta tarjeta-carrusel">
            <div class="contenedor-imagen">
              <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" [alt]="'Foto de ' + anuncio.tipo + ' en ' + (anuncio.zona?.nombre ?? 'Vinto')" (error)="$any($event.target).hidden = true" />
              <span class="insignia-sello" *ngIf="sello(anuncio) as s" [ngClass]="s.clase">{{ s.texto }}</span>
              <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Publicador verificado</span>
              <span class="insignia-pendiente" *ngIf="anuncio.publicador && !anuncio.publicador.verificado">Publicador no verificado</span>
            </div>
            <h2>{{ anuncio.titulo }}</h2>
            <p class="texto-suave fila-ubicacion">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {{ anuncio.zona?.nombre }}
            </p>
            <div class="fila-tarjeta">
              <p class="precio">Bs. {{ anuncio.precio | number: '1.0-0' }}<span class="por-mes">/mes</span></p>
              <span class="chip">{{ anuncio.tipo }}</span>
            </div>
            <span class="ver-anuncio">Ver anuncio →</span>
          </a>
        </div>
      </ng-container>

      <div class="encabezado-seccion">
        <div>
          <h2>En el mapa</h2>
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
            <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" [alt]="'Foto de ' + anuncio.tipo + ' en ' + (anuncio.zona?.nombre ?? 'Vinto')" (error)="$any($event.target).hidden = true" />
            <span class="insignia-sello" *ngIf="sello(anuncio) as s" [ngClass]="s.clase">{{ s.texto }}</span>
            <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Publicador verificado</span>
            <span class="insignia-pendiente" *ngIf="anuncio.publicador && !anuncio.publicador.verificado">Publicador no verificado</span>
          </div>
          <h2>{{ anuncio.titulo }}</h2>
          <p class="texto-suave fila-ubicacion">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            {{ anuncio.zona?.nombre }}
          </p>
          <div class="fila-tarjeta">
            <p class="precio">Bs. {{ anuncio.precio | number: '1.0-0' }}<span class="por-mes">/mes</span></p>
            <span class="chip">{{ anuncio.tipo }}</span>
          </div>
          <span class="ver-anuncio">Ver anuncio →</span>
        </a>
      </div>
      <ng-template #sinResultados>
        <p class="texto-suave">No hay anuncios que coincidan con la búsqueda.</p>
      </ng-template>
    </section>
  `,
})
export class ExplorarComponent implements OnInit, AfterViewInit {
  private readonly apiUrl = '/api';
  private mapa?: maplibregl.Map;
  private mapaListo = false;
  private marcadores: maplibregl.Marker[] = [];
  anuncios: Anuncio[] = [];
  destacados: Anuncio[] = [];
  zonas: Zona[] = [];
  readonly opcionesTipo: OpcionSelector<string>[] = [
    { valor: '', texto: 'Todos los tipos' },
    { valor: 'cuarto', texto: 'Cuarto' },
    { valor: 'garzonier', texto: 'Garzonier' },
    { valor: 'departamento', texto: 'Departamento' },
  ];
  readonly opcionesPrecio: OpcionSelector<number | null>[] = [
    { valor: null, texto: 'Cualquier precio' },
    ...RANGOS_PRECIO.map((rango) => ({ valor: rango.valor, texto: rango.etiqueta })),
  ];
  opcionesZona: OpcionSelector<number | null>[] = [{ valor: null, texto: 'Todas las zonas' }];
  termino = '';
  tipo = '';
  zonaId: number | null = null;
  precioMax: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly anuncioService: AnuncioService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly favoritoService: FavoritoService,
  ) {}

  ngOnInit(): void {
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') || '';
    const zonaParam = this.route.snapshot.queryParamMap.get('zonaId');
    this.zonaId = zonaParam ? Number(zonaParam) : null;
    const precioParam = this.route.snapshot.queryParamMap.get('precioMax');
    this.precioMax = precioParam ? Number(precioParam) : null;

    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => {
      this.zonas = res;
      this.opcionesZona = [{ valor: null, texto: 'Todas las zonas' }, ...res.map((zona) => ({ valor: zona.id, texto: zona.nombre }))];
    });

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
    const acciones = crearAccionesMapa(this.router, this.authService, this.favoritoService);
    this.anuncios.forEach((anuncio) => {
      const zona = anuncio.zona as Zona;
      if (zona?.latitud && zona?.longitud) {
        const punto = dispersarCoordenada(Number(zona.latitud), Number(zona.longitud), anuncio.id);
        this.marcadores.push(crearMarcadorAnuncio(this.mapa!, anuncio, punto, acciones));
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
        // Los impulsados siempre aparecen (es lo que paga el publicador), pero los que tienen foto van primero.
        this.destacados = res
          .filter((anuncio) => anuncio.enPortada)
          .sort((a, b) => Number(!!b.fotos?.length) - Number(!!a.fotos?.length));
        this.pintarMarcadores();
      });
  }

  sello(anuncio: Anuncio) {
    return obtenerSelloImpulso(anuncio);
  }

  buscar(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tipo: this.tipo || undefined,
        zonaId: this.zonaId || undefined,
        precioMax: this.precioMax || undefined,
      },
    });
    this.cargarAnuncios();
  }
}
