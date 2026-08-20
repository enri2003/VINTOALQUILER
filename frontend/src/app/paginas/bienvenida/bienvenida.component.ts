import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-ancho pantalla-bienvenida">
      <div class="tarjeta-bienvenida">
        <div class="icono-marca">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8.5" cy="8.5" r="4.5" />
            <path d="M11.8 11.8 21 21" />
            <path d="M17.5 21 21 17.5" />
          </svg>
        </div>
        <h1>Alquileres Vinto</h1>
        <p>Cuartos, garzoniers y departamentos del municipio de Vinto.</p>

        <a routerLink="/registro" class="boton-principal boton-ancho">Crear mi cuenta gratis</a>
        <div class="acciones-secundarias">
          <a routerLink="/login" class="boton-secundario">Ya tengo cuenta</a>
          <a routerLink="/explorar" class="boton-secundario">Solo mirar</a>
        </div>
        <p class="nota-bienvenida">
          Funcionando en Vinto. Mas adelante llegaremos a Quillacollo y a toda Cochabamba.
        </p>
      </div>

      <div class="grilla-info">
        <div class="tarjeta-info">
          <h2>Buscas</h2>
          <p>Sabes el precio y a cuantas cuadras queda antes de salir de tu casa.</p>
        </div>
        <div class="tarjeta-info">
          <h2>Publicas</h2>
          <p>Gratis y en minutos. Te escriben por WhatsApp sin mostrar tu numero.</p>
        </div>
      </div>
    </section>
  `,
})
export class BienvenidaComponent {}
