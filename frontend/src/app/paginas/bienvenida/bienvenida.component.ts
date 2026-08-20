import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="pantalla-bienvenida">
      <div class="icono-marca">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8.5" cy="8.5" r="4.5" />
          <path d="M11.8 11.8 21 21" />
          <path d="M17.5 21 21 17.5" />
        </svg>
      </div>

      <h1>Alquileres Vinto</h1>
      <p>Cuartos, garzoniers y departamentos del municipio de Vinto.</p>

      <div class="acciones-bienvenida">
        <a routerLink="/registro" class="boton-principal">Crear cuenta</a>
        <a routerLink="/login" class="boton-fantasma">Iniciar sesion</a>
        <a routerLink="/explorar" class="enlace-visitante">Mirar como visitante</a>
      </div>

      <div class="rasgos-bienvenida">
        <div class="rasgo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 20 8v13H4V8Z" />
            <path d="M9 21v-7h6v7" />
          </svg>
          <span>Cuartos y deptos</span>
        </div>
        <div class="rasgo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Zonas de Vinto</span>
        </div>
        <div class="rasgo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span>Publicadores verificados</span>
        </div>
      </div>
    </section>
  `,
})
export class BienvenidaComponent {}
