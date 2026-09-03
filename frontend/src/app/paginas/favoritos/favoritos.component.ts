import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anuncio } from '../../servicios/anuncio.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="favoritos">
      <h1>Mis favoritos ♥</h1>
      <p class="texto-suave">Estos son los alquileres que has guardado.</p>

      <div class="grilla" *ngIf="favoritos.length; else sinFavoritos">
        <a *ngFor="let anuncio of favoritos" [routerLink]="['/anuncio', anuncio.id]" class="tarjeta">
          <span class="corazon-tarjeta">♥</span>
          <img *ngIf="anuncio.fotos?.length" [src]="anuncio.fotos[0].url" alt="" />
          <div class="fila-tarjeta">
            <p class="precio">Bs. {{ anuncio.precio }}</p>
            <span class="chip">{{ anuncio.tipo }}</span>
          </div>
          <h2>{{ anuncio.titulo }}</h2>
          <p class="texto-suave">{{ anuncio.zona?.nombre }}</p>
        </a>
      </div>
      <ng-template #sinFavoritos>
        <p class="texto-suave">Aun no guardaste ningun anuncio como favorito.</p>
      </ng-template>
    </section>
  `,
})
export class FavoritosComponent implements OnInit {
  private readonly apiUrl = '';
  favoritos: Anuncio[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
    this.http
      .get<{ anuncio: Anuncio }[]>(`${this.apiUrl}/favoritos`, { headers })
      .subscribe((res) => (this.favoritos = res.map((favorito) => favorito.anuncio)));
  }
}
