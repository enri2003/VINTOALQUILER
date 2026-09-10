import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Anuncio } from '../../servicios/anuncio.service';
import { FavoritoService } from '../../servicios/favorito.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="favoritos">
      <h1>Mis favoritos ♥</h1>
      <p class="texto-suave">Estos son los alquileres que has guardado. Selecciona 2 o mas para compararlos.</p>

      <div class="grilla" *ngIf="favoritos.length; else sinFavoritos">
        <div *ngFor="let anuncio of favoritos" class="tarjeta">
          <label class="seleccion-comparar">
            <input type="checkbox" [checked]="seleccionados.has(anuncio.id)" (change)="alternarSeleccion(anuncio.id)" />
            Comparar
          </label>
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

      <button
        class="boton-secundario boton-comparar"
        *ngIf="seleccionados.size >= 2"
        (click)="irAComparar()"
      >
        Comparar {{ seleccionados.size }} anuncios seleccionados
      </button>
    </section>
  `,
  styles: [
    `
      .seleccion-comparar {
        display: block;
        font-size: 0.8rem;
        margin-bottom: 4px;
      }
      .boton-comparar {
        margin-top: 16px;
      }
      .tarjeta img {
        width: calc(100% + 44px);
        margin: 8px -22px 16px;
        height: 168px;
        object-fit: cover;
        display: block;
      }
    `,
  ],
})
export class FavoritosComponent implements OnInit {
  favoritos: Anuncio[] = [];
  seleccionados = new Set<number>();

  constructor(
    private readonly favoritoService: FavoritoService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.favoritoService.listar().subscribe((res) => (this.favoritos = res.map((favorito) => favorito.anuncio)));
  }

  quitar(anuncioId: number): void {
    this.seleccionados.delete(anuncioId);
    this.favoritoService.quitar(anuncioId).subscribe(() => this.cargar());
  }

  alternarSeleccion(anuncioId: number): void {
    if (this.seleccionados.has(anuncioId)) {
      this.seleccionados.delete(anuncioId);
    } else {
      this.seleccionados.add(anuncioId);
    }
  }

  irAComparar(): void {
    this.router.navigate(['/comparacion'], { queryParams: { ids: [...this.seleccionados].join(',') } });
  }
}
