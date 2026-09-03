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
        <div class="icono-marca">
          <img src="/assets/icono-logo.png" alt="" />
        </div>
        <h2>Vinto<span class="acento-marca">Alquiler</span></h2>
        <p>Cuartos, garzoniers y departamentos del municipio de Vinto, con contacto seguro y anuncios verificados.</p>
      </div>
      <div class="panel-formulario">
        <div class="contenido-formulario">
          <h1>Iniciar sesion</h1>
          <p class="subtitulo">Ingresa para publicar, contactar o guardar favoritos.</p>
          <form (ngSubmit)="enviar()">
            <label>
              <span class="etiqueta">Correo electronico</span>
              <input type="email" name="correo" placeholder="tucorreo@ejemplo.com" [(ngModel)]="correo" required />
            </label>
            <label>
              <span class="etiqueta">Contrasena</span>
              <input type="password" name="clave" placeholder="Tu contrasena" [(ngModel)]="clave" required />
            </label>
            <div class="fila-terminos fila-opciones-login">
              <label class="opcion-recordarme">
                <input type="checkbox" name="recordarme" [(ngModel)]="recordarme" />
                <span>Recordarme</span>
              </label>
              <a href="javascript:void(0)" class="enlace-olvido" (click)="mostrarAyudaClave()">¿Olvidaste tu contrasena?</a>
            </div>
            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
          <p class="texto-suave" *ngIf="ayudaClave">
            Escribe a soporte por WhatsApp o correo para restablecer tu contrasena; la recuperacion automatica aun no esta disponible.
          </p>
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
  recordarme = true;
  error = '';
  ayudaClave = false;
  cargando = false;

  mostrarAyudaClave(): void {
    this.ayudaClave = true;
  }

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
