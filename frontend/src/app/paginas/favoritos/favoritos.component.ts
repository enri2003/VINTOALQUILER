import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Anuncio } from '../../servicios/anuncio.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="favoritos">
      <h1>Mis favoritos</h1>
      <div *ngFor="let anuncio of favoritos" class="tarjeta">
        <h2>{{ anuncio.titulo }}</h2>
        <p class="precio">Bs. {{ anuncio.precio }}</p>
      </div>
    </section>
  `,
})
export class FavoritosComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:3000';
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
