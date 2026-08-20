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
    <section class="pagina-angosta">
      <div class="panel">
        <h1>Crear cuenta</h1>
        <p class="subtitulo">Regístrate para publicar o buscar alquileres en Vinto.</p>
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
