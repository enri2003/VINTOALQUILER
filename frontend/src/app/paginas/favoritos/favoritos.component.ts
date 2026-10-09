import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Anuncio } from '../../servicios/anuncio.service';
import { FavoritoService } from '../../servicios/favorito.service';

const MIN_COMPARAR = 2;
const MAX_COMPARAR = 3;

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="favoritos">
      <h1>Mis favoritos ♥</h1>

      <ng-container *ngIf="favoritos.length; else estadoVacio">
        <div class="barra-favoritos">
          <span>{{ favoritos.length }} {{ favoritos.length === 1 ? 'anuncio guardado' : 'anuncios guardados' }}</span>
          <div class="accion-comparar">
            <span class="contador-seleccion">Seleccionados: {{ seleccionados.size }} de {{ maxComparar }}</span>
            <button
              class="boton-principal"
              [disabled]="seleccionados.size < minComparar"
              (click)="irAComparar()"
            >
              Comparar seleccionados
            </button>
          </div>
        </div>
        <p class="mensaje-limite" *ngIf="seleccionados.size >= maxComparar">
          Puedes comparar hasta {{ maxComparar }} anuncios a la vez.
        </p>

        <div class="grilla">
          <div *ngFor="let anuncio of favoritos" class="tarjeta" [class.no-disponible]="anuncio.estado && anuncio.estado !== 'disponible'">
            <label class="seleccion-comparar">
              <input
                type="checkbox"
                [checked]="seleccionados.has(anuncio.id)"
                [disabled]="!seleccionados.has(anuncio.id) && seleccionados.size >= maxComparar"
                (change)="alternarSeleccion(anuncio.id)"
              />
              Comparar
            </label>
            <a [routerLink]="['/anuncio', anuncio.id]">
              <span class="corazon-tarjeta">♥</span>
              <div class="contenedor-imagen">
                <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" (error)="$any($event.target).hidden = true" />
                <span class="insignia-verificado" *ngIf="anuncio.publicador?.verificado">✓ Publicador verificado</span>
                <span class="insignia-pendiente" *ngIf="anuncio.publicador && !anuncio.publicador.verificado">Publicador no verificado</span>
              </div>
              <div class="fila-tarjeta">
                <p class="precio">Bs. {{ anuncio.precio }}</p>
                <span class="chip">{{ anuncio.tipo }}</span>
              </div>
              <h2>{{ anuncio.titulo }}</h2>
              <p class="texto-suave">{{ anuncio.zona?.nombre }}</p>
              <p class="aviso-no-disponible" *ngIf="anuncio.estado && anuncio.estado !== 'disponible'">
                Este anuncio ya no está disponible.
              </p>
            </a>
            <div class="acciones-tarjeta">
              <a class="boton-secundario" [routerLink]="['/anuncio', anuncio.id]">Ver anuncio</a>
              <button class="boton-secundario" (click)="quitar(anuncio.id)">Quitar de favoritos</button>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #estadoVacio>
        <div class="estado-vacio">
          <span class="corazon-vacio">♡</span>
          <h2>Todavía no tienes favoritos</h2>
          <p class="texto-suave">Guarda los anuncios que te interesen para compararlos y revisarlos más tarde.</p>
          <a class="boton-principal" routerLink="/explorar">Explorar alquileres</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .favoritos { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
      .barra-favoritos {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 14px;
        padding: 14px 18px;
        margin: 16px 0 8px;
      }
      .accion-comparar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      .contador-seleccion { font-size: 13px; color: var(--texto-suave, #6E6255); }
      .accion-comparar .boton-principal:disabled { opacity: 0.5; cursor: not-allowed; }
      .mensaje-limite { font-size: 13px; color: var(--acento-oscuro); margin: 4px 0 12px; }
      .seleccion-comparar { display: block; font-size: 0.8rem; margin-bottom: 4px; }
      .tarjeta .contenedor-imagen { margin-top: 8px; }
      .tarjeta .insignia-verificado,
      .tarjeta .insignia-pendiente { top: 12px; left: 12px; right: auto; }
      .tarjeta.no-disponible { opacity: 0.75; }
      .aviso-no-disponible { color: var(--acento-oscuro); font-size: 13px; font-weight: 600; margin: 6px 0 0; }
      .acciones-tarjeta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .acciones-tarjeta a, .acciones-tarjeta button { flex: 1; text-align: center; }
      .estado-vacio {
        max-width: 440px;
        margin: 48px auto 0;
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 18px;
        padding: 36px 28px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .corazon-vacio { font-size: 42px; color: var(--acento); line-height: 1; }
      .estado-vacio h2 { margin: 0; font-size: 20px; }
      .estado-vacio p { margin: 0 0 8px; }
    `,
  ],
})
export class FavoritosComponent implements OnInit {
  readonly minComparar = MIN_COMPARAR;
  readonly maxComparar = MAX_COMPARAR;
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
    } else if (this.seleccionados.size < MAX_COMPARAR) {
      this.seleccionados.add(anuncioId);
    }
  }

  irAComparar(): void {
    if (this.seleccionados.size < MIN_COMPARAR) return;
    this.router.navigate(['/comparacion'], { queryParams: { ids: [...this.seleccionados].join(',') } });
  }
}
