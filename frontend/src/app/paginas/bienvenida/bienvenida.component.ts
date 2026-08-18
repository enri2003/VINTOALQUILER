import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="bienvenida">
      <h1>Alquileres Vinto</h1>
      <p>Encuentra cuartos, garzoniers y departamentos cerca de la UAB.</p>
      <a routerLink="/login">Iniciar sesion</a>
      <a routerLink="/registro">Crear cuenta</a>
    </section>
  `,
})
export class BienvenidaComponent {}
