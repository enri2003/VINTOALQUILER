import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="bienvenida">
      <div class="hero">
        <h1>Alquileres Vinto</h1>
        <p>Encuentra cuartos, garzoniers y departamentos cerca de la UAB, con anuncios verificados y contacto seguro.</p>
        <div class="acciones">
          <a routerLink="/registro" class="boton-principal">Crear cuenta</a>
          <a routerLink="/login" class="boton-secundario">Iniciar sesion</a>
        </div>
      </div>
    </section>
  `,
})
export class BienvenidaComponent {}
