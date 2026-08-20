import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="pagina-dividida">
      <div class="panel-marca">
        <div class="icono-marca">⌁</div>
        <h2>Alquileres Vinto</h2>
        <p>Cuartos, garzoniers y departamentos del municipio de Vinto, con contacto seguro y anuncios verificados.</p>
      </div>
      <div class="panel-formulario">
        <div class="contenido-formulario">
          <h1>Iniciar sesion</h1>
          <p class="subtitulo">Ingresa para publicar, contactar o guardar favoritos.</p>
          <form (ngSubmit)="enviar()">
            <label>
              <span class="etiqueta">Correo</span>
              <input type="email" name="correo" placeholder="tucorreo@ejemplo.com" [(ngModel)]="correo" required />
            </label>
            <label>
              <span class="etiqueta">Contrasena</span>
              <input type="password" name="clave" placeholder="Tu contrasena" [(ngModel)]="clave" required />
            </label>
            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
          <p class="pie">
            ¿No tienes cuenta? <a routerLink="/registro">Crea una</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  correo = '';
  clave = '';
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  enviar(): void {
    this.error = '';
    this.cargando = true;
    this.authService.iniciarSesion(this.correo, this.clave).subscribe({
      next: () => this.router.navigate(['/explorar']),
      error: (err) => {
        this.cargando = false;
        this.error =
          err?.status === 0
            ? 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.'
            : 'Correo o contrasena incorrectos';
      },
    });
  }
}
