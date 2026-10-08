import { AfterViewInit, Component } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Router } from '@angular/router';
import { AnuncioService } from '../../servicios/anuncio.service';
import { AuthService } from '../../servicios/auth.service';
import { FavoritoService } from '../../servicios/favorito.service';
import { dispersarCoordenada } from '../../utilidades/coordenadas.util';
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
  template: `<div id="mapa" class="mapa-pagina"></div>`,
})
export class MapaComponent implements AfterViewInit {
  private mapa!: maplibregl.Map;

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly router: Router,
    private readonly authService: AuthService,
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
      anuncios.forEach((anuncio) => {
        const zona = anuncio.zona as any;
        if (!zona?.latitud || !zona?.longitud) return;
        const punto = dispersarCoordenada(Number(zona.latitud), Number(zona.longitud), anuncio.id);
        crearMarcadorAnuncio(this.mapa, anuncio, punto, acciones);
      });
    });
  }
}
