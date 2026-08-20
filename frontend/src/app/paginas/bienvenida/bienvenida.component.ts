import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-ancho pantalla-bienvenida">
      <div class="tarjeta-bienvenida">
        <div class="icono-marca">⌁</div>
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
