import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="pagina-dividida">
      <div class="panel-marca">
        <div class="icono-marca">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8.5" cy="8.5" r="4.5" />
            <path d="M11.8 11.8 21 21" />
            <path d="M17.5 21 21 17.5" />
          </svg>
        </div>
        <h2>Alquileres Vinto</h2>
        <p>Publica gratis en minutos o encuentra tu proximo lugar cerca de la UAB y del centro de Vinto.</p>
      </div>
      <div class="panel-formulario">
        <div class="contenido-formulario">
          <h1>Crear cuenta</h1>
          <p class="subtitulo">Registrate para publicar o buscar alquileres en Vinto.</p>
          <form (ngSubmit)="enviar()">
            <label>
              <span class="etiqueta">Nombre</span>
              <input type="text" name="nombre" placeholder="Tu nombre completo" [(ngModel)]="nombre" required />
            </label>
            <label>
              <span class="etiqueta">Correo</span>
              <input type="email" name="correo" placeholder="tucorreo@ejemplo.com" [(ngModel)]="correo" required />
            </label>
            <label>
              <span class="etiqueta">Contrasena</span>
              <input type="password" name="clave" placeholder="Minimo 8 caracteres" [(ngModel)]="clave" required minlength="8" />
            </label>
            <label>
              <span class="etiqueta">Celular</span>
              <input type="tel" name="celular" placeholder="70000000" [(ngModel)]="celular" required />
            </label>
            <label>
              <span class="etiqueta">Quiero</span>
              <select name="rol" [(ngModel)]="rol" required>
                <option value="interesado">Buscar alquiler</option>
                <option value="publicador">Publicar alquileres</option>
              </select>
            </label>
            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Creando cuenta...' : 'Registrarme' }}
            </button>
          </form>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
          <p class="pie">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesion</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class RegistroComponent {
  nombre = '';
  correo = '';
  clave = '';
  celular = '';
  rol: 'interesado' | 'publicador' = 'interesado';
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  enviar(): void {
    this.error = '';
    this.cargando = true;
    this.authService
      .registrar({
        nombre: this.nombre,
        correo: this.correo,
        clave: this.clave,
        celular: this.celular,
        rol: this.rol,
      })
      .subscribe({
        next: () => this.router.navigate(['/explorar']),
        error: (err) => {
          this.cargando = false;
          this.error =
            err?.error?.message ||
            (err?.status === 0
              ? 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.'
              : 'No se pudo completar el registro');
        },
      });
  }
}
