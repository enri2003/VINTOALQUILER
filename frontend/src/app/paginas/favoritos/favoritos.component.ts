import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anuncio } from '../../servicios/anuncio.service';
import { FavoritoService } from '../../servicios/favorito.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="favoritos">
      <h1>Mis favoritos ♥</h1>
      <p class="texto-suave">Estos son los alquileres que has guardado.</p>

      <div class="grilla" *ngIf="favoritos.length; else sinFavoritos">
        <div *ngFor="let anuncio of favoritos" class="tarjeta">
          <a [routerLink]="['/anuncio', anuncio.id]">
            <span class="corazon-tarjeta">♥</span>
            <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
            <div class="fila-tarjeta">
              <p class="precio">Bs. {{ anuncio.precio }}</p>
              <span class="chip">{{ anuncio.tipo }}</span>
            </div>
            <h2>{{ anuncio.titulo }}</h2>
            <p class="texto-suave">{{ anuncio.zona?.nombre }}</p>
          </a>
          <button class="boton-secundario" (click)="quitar(anuncio.id)">Quitar de favoritos</button>
        </div>
      </div>
      <ng-template #sinFavoritos>
        <p class="texto-suave">Aun no guardaste ningun anuncio como favorito.</p>
      </ng-template>
    </section>
  `,
})
export class FavoritosComponent implements OnInit {
  favoritos: Anuncio[] = [];

  constructor(private readonly favoritoService: FavoritoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.favoritoService.listar().subscribe((res) => (this.favoritos = res.map((favorito) => favorito.anuncio)));
  }

  quitar(anuncioId: number): void {
    this.favoritoService.quitar(anuncioId).subscribe(() => this.cargar());
  }
}
