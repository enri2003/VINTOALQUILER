import { AfterViewInit, Component } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Router } from '@angular/router';
import { AnuncioService } from '../../servicios/anuncio.service';

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
  ) {}

  ngAfterViewInit(): void {
    this.mapa = new maplibregl.Map({
      container: 'mapa',
      style: ESTILO_OSM_CLARO,
      center: CENTRO_VINTO,
      zoom: 14,
    });
    this.mapa.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    this.anuncioService.listar().subscribe((anuncios) => {
      anuncios.forEach((anuncio) => {
        const zona = anuncio.zona as any;
        if (!zona?.latitud || !zona?.longitud) return;

        const elemento = document.createElement('div');
        elemento.className = 'pin-anuncio';
        elemento.innerHTML = ICONO_CASA;
        elemento.addEventListener('click', () => this.router.navigate(['/anuncio', anuncio.id]));

        const verificado = (anuncio as any).publicador?.verificado;
        new maplibregl.Marker({ element: elemento })
          .setLngLat([zona.longitud, zona.latitud])
          .setPopup(
            new maplibregl.Popup({ offset: 24 }).setHTML(
              `<strong>${anuncio.titulo}</strong><br/>${capitalizar(anuncio.tipo)} · Bs ${anuncio.precio}/mes${verificado ? ' · <span style="color:#3E8E5B">✓ Verificado</span>' : ''}`,
            ),
          )
          .addTo(this.mapa);
      });
    });
  }
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
