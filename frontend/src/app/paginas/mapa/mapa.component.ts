import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  template: `<div id="mapa" style="height: 480px;"></div>`,
})
export class MapaComponent implements OnInit, AfterViewInit {
  private mapa!: L.Map;

  constructor(private readonly anuncioService: AnuncioService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.mapa = L.map('mapa').setView([-17.4139, -66.2434], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; colaboradores de OpenStreetMap',
    }).addTo(this.mapa);

    this.anuncioService.listar().subscribe((anuncios) => {
      anuncios.forEach((anuncio: any) => {
        const zona = anuncio.zona;
        if (zona?.latitud && zona?.longitud) {
          L.marker([zona.latitud, zona.longitud])
            .addTo(this.mapa)
            .bindPopup(`${anuncio.titulo} - Bs. ${anuncio.precio}`);
        }
      });
    });
  }
}
