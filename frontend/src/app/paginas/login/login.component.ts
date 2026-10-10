import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
          <h1>Iniciar sesión</h1>
          <p class="subtitulo">Ingresa para publicar, contactar o guardar favoritos.</p>
          <p class="aviso-sesion" *ngIf="volver">Inicia sesión para continuar con la página que solicitaste.</p>
          <form (ngSubmit)="enviar()">
            <label>
              <span class="etiqueta">Correo electrónico</span>
              <input type="email" name="correo" placeholder="tucorreo@ejemplo.com" [(ngModel)]="correo" required />
            </label>
            <label>
              <span class="etiqueta">Contraseña</span>
              <div class="campo-clave">
                <input [type]="verClave ? 'text' : 'password'" name="clave" placeholder="Tu contraseña" [(ngModel)]="clave" required />
                <button type="button" class="boton-ver-clave" (click)="verClave = !verClave" [attr.aria-label]="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  <svg *ngIf="!verClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  <svg *ngIf="verClave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.3 21.3 0 0 1 5.06-5.94M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a21.3 21.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
                </button>
              </div>
            </label>
            <div class="fila-terminos fila-opciones-login">
              <label class="opcion-recordarme">
                <input type="checkbox" name="recordarme" [(ngModel)]="recordarme" />
                <span>Recordarme</span>
              </label>
              <a href="javascript:void(0)" class="enlace-olvido" (click)="mostrarAyudaClave()">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
          <p class="texto-suave" *ngIf="ayudaClave">
            Escribe a soporte por WhatsApp o correo para restablecer tu contraseña; la recuperación automática aún no está disponible.
          </p>
          <p class="pie">
            ¿No tienes cuenta? <a routerLink="/registro">Crea una</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .campo-clave {
        position: relative;
        display: flex;
      }
      .campo-clave input {
        flex: 1;
        padding-right: 40px;
      }
      .boton-ver-clave {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        color: var(--texto-suave, #8a8a8a);
        display: flex;
      }
      .boton-ver-clave svg {
        width: 19px;
        height: 19px;
      }
    `,
  ],
})
export class LoginComponent {
  correo = '';
  clave = '';
  verClave = false;
  recordarme = true;
  error = '';
  ayudaClave = false;
  cargando = false;
  // Solo se aceptan rutas internas para evitar redirecciones a sitios externos.
  readonly volver: string | null;

  mostrarAyudaClave(): void {
    this.ayudaClave = true;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    route: ActivatedRoute,
  ) {
    const destino = route.snapshot.queryParamMap.get('volver');
    this.volver = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : null;
  }

  enviar(): void {
    this.error = '';
    this.cargando = true;
    this.authService.iniciarSesion(this.correo, this.clave).subscribe({
      next: () => this.router.navigateByUrl(this.volver ?? '/explorar'),
      error: (err) => {
        this.cargando = false;
        this.error =
          err?.status === 0
            ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
            : 'Correo o contraseña incorrectos';
      },
    });
  }
}
