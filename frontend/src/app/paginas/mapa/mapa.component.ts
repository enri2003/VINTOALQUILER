import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Router, RouterLink } from '@angular/router';
import { AnuncioService } from '../../servicios/anuncio.service';
import { AuthService } from '../../servicios/auth.service';
import { FavoritoService } from '../../servicios/favorito.service';
import { puntoEnMapa } from '../../utilidades/coordenadas.util';
import { crearAccionesMapa, crearMarcadorAnuncio } from '../../utilidades/mapa-popup.util';

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

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-mapa-pagina">
      <div class="aviso-ubicacion-aprox aviso-flotante" *ngIf="mostrarAvisoAproximado">
        <span>📍 Ves ubicaciones aproximadas. Verifica tu identidad para ver el punto exacto de cada inmueble.</span>
        <a [routerLink]="authService.estaAutenticado() ? '/verificacion' : '/login'">
          {{ authService.estaAutenticado() ? 'Verificar ahora' : 'Iniciar sesión' }}
        </a>
      </div>
      <div id="mapa" class="mapa-pagina"></div>
    </div>
  `,
  styles: [
    `
      .contenedor-mapa-pagina { position: relative; }
      .aviso-flotante {
        position: absolute; top: 14px; left: 50%; transform: translateX(-50%); z-index: 5;
        width: min(640px, calc(100% - 28px)); margin: 0; box-shadow: 0 8px 24px rgba(42, 33, 24, 0.15);
      }
    `,
  ],
})
export class MapaComponent implements AfterViewInit {
  private mapa!: maplibregl.Map;
  /** Se muestra si hay anuncios dibujados en ubicación aproximada (y quien mira no es publicador). */
  mostrarAvisoAproximado = false;

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly router: Router,
    readonly authService: AuthService,
    private readonly favoritoService: FavoritoService,
  ) {}

  ngAfterViewInit(): void {
    this.mapa = new maplibregl.Map({
      container: 'mapa',
      style: ESTILO_OSM_CLARO,
      center: CENTRO_VINTO,
      zoom: 14,
    });
    this.mapa.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    const acciones = crearAccionesMapa(this.router, this.authService, this.favoritoService);
    this.anuncioService.listar().subscribe((anuncios) => {
      let hayAproximados = false;
      anuncios.forEach((anuncio) => {
        const punto = puntoEnMapa(anuncio as any);
        if (!punto) return;
        hayAproximados ||= !punto.exacto;
        crearMarcadorAnuncio(this.mapa, anuncio, punto, acciones);
      });
      this.mostrarAvisoAproximado = hayAproximados && !this.authService.esPublicador();
    });
  }
}
