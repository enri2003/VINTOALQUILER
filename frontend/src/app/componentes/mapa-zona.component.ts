import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

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
  layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.6, 'raster-brightness-min': 0.35 } }],
};

/**
 * Vista previa de dónde aparecerá un anuncio en el mapa público: un círculo sobre la zona elegida.
 * Representa el área aproximada (igual que el mapa público, que ubica los anuncios por zona),
 * nunca la dirección exacta del inmueble.
 */
@Component({
  selector: 'app-mapa-zona',
  standalone: true,
  template: `<div #contenedor class="mapa-zona"></div>`,
  styles: [
    `
      :host { display: block; }
      .mapa-zona { width: 100%; height: 220px; border-radius: 14px; overflow: hidden; border: 1px solid var(--borde, #ECE1D2); }
    `,
  ],
})
export class MapaZonaComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitud?: number | string | null;
  @Input() longitud?: number | string | null;
  @ViewChild('contenedor') contenedor?: ElementRef<HTMLDivElement>;

  private mapa?: maplibregl.Map;
  private marcador?: maplibregl.Marker;

  ngAfterViewInit(): void {
    if (!this.contenedor) return;
    this.mapa = new maplibregl.Map({
      container: this.contenedor.nativeElement,
      style: ESTILO_OSM_CLARO,
      center: CENTRO_VINTO,
      zoom: 13,
      attributionControl: { compact: true },
      interactive: false,
    });
    this.mapa.on('load', () => this.actualizar());
  }

  ngOnChanges(): void {
    this.actualizar();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  private actualizar(): void {
    if (!this.mapa || !this.mapa.isStyleLoaded()) return;
    const lat = Number(this.latitud);
    const lng = Number(this.longitud);
    if (!lat || !lng) {
      this.marcador?.remove();
      this.marcador = undefined;
      this.mapa.jumpTo({ center: CENTRO_VINTO, zoom: 13 });
      return;
    }
    // Círculo del área aproximada: el mismo radio en el que el mapa público reparte los anuncios de la zona.
    const elemento = document.createElement('div');
    elemento.className = 'area-aproximada';
    elemento.innerHTML = '<span class="punto-area"></span>';
    this.marcador?.remove();
    this.marcador = new maplibregl.Marker({ element: elemento }).setLngLat([lng, lat]).addTo(this.mapa);
    this.mapa.easeTo({ center: [lng, lat], zoom: 15, duration: 600 });
  }
}
