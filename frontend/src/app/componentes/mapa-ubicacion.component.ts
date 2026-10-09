import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
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

export type ModoMapa = 'elegir' | 'exacta' | 'aproximada';

/**
 * Mapa pequeño de la ubicación de un inmueble:
 * - "elegir": el publicador toca el mapa o arrastra el pin para marcar el punto exacto.
 * - "exacta": muestra el pin en el punto exacto (solo para quien tiene permiso de verlo).
 * - "aproximada": muestra un círculo en la ubicación aproximada, sin pin, para el público.
 */
@Component({
  selector: 'app-mapa-ubicacion',
  standalone: true,
  template: `<div #contenedor class="mapa-ubicacion" [class.editable]="modo === 'elegir'"></div>`,
  styles: [
    `
      :host { display: block; }
      .mapa-ubicacion { width: 100%; height: 260px; border-radius: 14px; overflow: hidden; border: 1px solid var(--borde, #ECE1D2); }
      .mapa-ubicacion.editable { cursor: crosshair; }
    `,
  ],
})
export class MapaUbicacionComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() modo: ModoMapa = 'exacta';
  @Input() latitud?: number | string | null;
  @Input() longitud?: number | string | null;
  /** En modo "elegir", hacia dónde mover el mapa cuando todavía no hay pin (ej. la zona elegida). */
  @Input() centro?: { lat: number | string; lng: number | string } | null;
  @Output() ubicacionChange = new EventEmitter<{ lat: number; lng: number }>();
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
      interactive: true,
      cooperativeGestures: this.modo !== 'elegir',
    });
    this.mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    if (this.modo === 'elegir') {
      this.mapa.on('click', (evento) => this.marcar(evento.lngLat.lat, evento.lngLat.lng));
    }
    this.mapa.on('load', () => this.dibujar(true));
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (!this.mapa?.isStyleLoaded()) return;
    if (cambios['latitud'] || cambios['longitud']) this.dibujar(false);
    if (cambios['centro'] && !this.tienePunto) this.irAlCentro();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  private get tienePunto(): boolean {
    return !!Number(this.latitud) && !!Number(this.longitud);
  }

  private marcar(lat: number, lng: number): void {
    this.latitud = lat;
    this.longitud = lng;
    this.dibujar(false);
    this.ubicacionChange.emit({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
  }

  private irAlCentro(): void {
    const lat = Number(this.centro?.lat);
    const lng = Number(this.centro?.lng);
    if (lat && lng) this.mapa?.easeTo({ center: [lng, lat], zoom: 15, duration: 600 });
  }

  private dibujar(centrar: boolean): void {
    if (!this.mapa) return;
    if (!this.tienePunto) {
      this.marcador?.remove();
      this.marcador = undefined;
      if (centrar) this.irAlCentro();
      return;
    }
    const posicion: [number, number] = [Number(this.longitud), Number(this.latitud)];
    if (this.marcador) {
      this.marcador.setLngLat(posicion);
    } else {
      this.marcador = this.crearMarcador(posicion);
    }
    if (centrar) this.mapa.jumpTo({ center: posicion, zoom: this.modo === 'aproximada' ? 15 : 16 });
  }

  private crearMarcador(posicion: [number, number]): maplibregl.Marker {
    if (this.modo === 'aproximada') {
      const area = document.createElement('div');
      area.className = 'area-aproximada';
      return new maplibregl.Marker({ element: area }).setLngLat(posicion).addTo(this.mapa!);
    }
    const marcador = new maplibregl.Marker({ color: '#C9622D', draggable: this.modo === 'elegir' }).setLngLat(posicion).addTo(this.mapa!);
    if (this.modo === 'elegir') {
      marcador.on('dragend', () => {
        const punto = marcador.getLngLat();
        this.marcar(punto.lat, punto.lng);
      });
    }
    return marcador;
  }
}
