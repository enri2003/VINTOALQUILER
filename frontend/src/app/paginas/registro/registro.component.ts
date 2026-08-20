import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

const PERFILES = ['Estudiante', 'Trabajador', 'Ejecutivo', 'Pareja', 'Familia', 'Otro'];

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
          <a routerLink="/" class="enlace-volver">← Volver</a>
          <h1>Crear cuenta</h1>
          <p class="subtitulo">{{ rol === 'interesado' ? 'Busco donde alquilar en Vinto.' : 'Publico inmuebles en alquiler.' }}</p>

          <div class="selector-rol">
            <button
              type="button"
              class="opcion-rol"
              [class.activa]="rol === 'interesado'"
              (click)="rol = 'interesado'"
            >
              <span class="titulo-opcion">Interesado</span>
              <span class="detalle-opcion">Busco alquiler</span>
            </button>
            <button
              type="button"
              class="opcion-rol"
              [class.activa]="rol === 'publicador'"
              (click)="rol = 'publicador'"
            >
              <span class="titulo-opcion">Publicador</span>
              <span class="detalle-opcion">Ofrezco inmueble</span>
            </button>
          </div>

          <form (ngSubmit)="enviar()">
            <label>
              <span class="etiqueta">Nombre completo</span>
              <input type="text" name="nombre" placeholder="Tu nombre completo" [(ngModel)]="nombre" required />
            </label>
            <label>
              <span class="etiqueta">Correo electronico</span>
              <input type="email" name="correo" placeholder="nombre@correo.com" [(ngModel)]="correo" required />
            </label>
            <label>
              <span class="etiqueta">Celular (WhatsApp)</span>
              <input type="tel" name="celular" placeholder="+591 7XXXXXXX" [(ngModel)]="celular" required />
            </label>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Quien va a vivir?</span>
              <div class="chips-perfil">
                <button
                  type="button"
                  *ngFor="let perfil of perfiles"
                  class="chip-seleccionable"
                  [class.activo]="perfilHogar === perfil"
                  (click)="perfilHogar = perfil"
                >
                  {{ perfil }}
                </button>
              </div>
            </div>

            <label>
              <span class="etiqueta">Contrasena</span>
              <input type="password" name="clave" placeholder="Minimo 8 caracteres" [(ngModel)]="clave" required minlength="8" />
            </label>

            <label class="fila-terminos">
              <input type="checkbox" name="acepta" [(ngModel)]="aceptaTerminos" required />
              <span>Acepto los terminos de uso y la politica de privacidad.</span>
            </label>

            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
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
  perfiles = PERFILES;
  nombre = '';
  correo = '';
  clave = '';
  celular = '';
  rol: 'interesado' | 'publicador' = 'interesado';
  perfilHogar = '';
  aceptaTerminos = false;
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
        perfilHogar: this.rol === 'interesado' ? this.perfilHogar || undefined : undefined,
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
