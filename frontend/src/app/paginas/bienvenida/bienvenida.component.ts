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
      <div class="acciones">
        <a routerLink="/login" class="boton-secundario">Iniciar sesion</a>
        <a routerLink="/registro" class="boton-principal">Crear cuenta</a>
      </div>
    </section>
  `,
})
export class BienvenidaComponent {}
