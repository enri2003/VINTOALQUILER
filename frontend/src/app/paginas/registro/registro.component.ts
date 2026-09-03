import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../servicios/auth.service';

const PERFILES = [
  {
    valor: 'Estudiante',
    etiqueta: 'Soy estudiante',
    icono: '<path d="M12 3 2 8l10 5 10-5Z" /><path d="M6 10.5V16c0 1 2.5 3 6 3s6-2 6-3v-5.5" />',
  },
  {
    valor: 'Pareja',
    etiqueta: 'Con mi pareja',
    icono:
      '<circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" /><path d="M13 14h2a5 5 0 0 1 5 5v1" />',
  },
  {
    valor: 'Familia',
    etiqueta: 'Con mi familia',
    icono: '<path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" />',
  },
  {
    valor: 'Trabajador',
    etiqueta: 'Vine por trabajo',
    icono: '<rect x="3" y="8" width="18" height="12" rx="2" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  },
];

const TIPOS_LUGAR = [
  { valor: 'cuarto', etiqueta: 'Cuarto', icono: '<rect x="6" y="3" width="12" height="18" rx="1" /><path d="M14 12h1" />' },
  {
    valor: 'garzonier',
    etiqueta: 'Garzonier',
    icono: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 18h18" /><path d="M6 10V7h5v3" />',
  },
  {
    valor: 'departamento',
    etiqueta: 'Departamento',
    icono: '<rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 8h1M14 8h1M9 13h1M14 13h1M9 18h1M14 18h1" />',
  },
];

const RANGOS_PRESUPUESTO = [
  { etiqueta: 'Hasta Bs 800', valor: 800 },
  { etiqueta: 'Bs 800 a 1.500', valor: 1500 },
  { etiqueta: 'Bs 1.500 a 2.500', valor: 2500 },
  { etiqueta: 'Mas de Bs 2.500', valor: 999999 },
];

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="pagina-dividida">
      <div class="panel-marca">
        <div class="icono-marca">
          <img src="/assets/icono-logo.png" alt="" />
        </div>
        <h2>Vinto<span class="acento-marca">Alquiler</span></h2>
        <p>Publica gratis en minutos o encuentra tu proximo lugar cerca de la UAB y del centro de Vinto.</p>
      </div>
      <div class="panel-formulario">
        <div class="contenido-formulario">
          <a routerLink="/" class="enlace-volver">← Volver</a>
          <h1 class="titulo-registro">Crear cuenta</h1>
          <p class="subtitulo subtitulo-centrado">
            {{ rol === 'interesado' ? 'Buscas alquiler en Vinto.' : 'Publicas inmuebles en alquiler en Vinto.' }}
          </p>

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
              <span class="etiqueta">Nombre</span>
              <input type="text" name="nombre" placeholder="Tu nombre completo" [(ngModel)]="nombre" />
            </label>
            <label>
              <span class="etiqueta">Correo</span>
              <input type="email" name="correo" placeholder="tu correo electronico" [(ngModel)]="correo" />
            </label>
            <label>
              <span class="etiqueta">Contrasena</span>
              <input type="password" name="clave" placeholder="Crea tu contrasena" [(ngModel)]="clave" />
            </label>
            <label>
              <span class="etiqueta">Celular (WhatsApp)</span>
              <input type="tel" name="celular" placeholder="+591 7XXXXXXX" [(ngModel)]="celular" />
            </label>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Con quien vas a vivir?</span>
              <div class="chips-perfil">
                <button
                  type="button"
                  *ngFor="let perfil of perfiles"
                  class="chip-seleccionable chip-con-icono"
                  [class.activo]="perfilHogar === perfil.valor"
                  (click)="elegirPerfil(perfil.valor)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="iconoSeguro(perfil.icono)"></svg>
                  {{ perfil.etiqueta }}
                </button>
              </div>
            </div>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Que tipo de lugar buscas?</span>
              <div class="chips-perfil chips-tipo-lugar">
                <button
                  type="button"
                  *ngFor="let tipo of tiposLugar"
                  class="chip-seleccionable chip-con-icono chip-columna"
                  [class.activo]="tipoPreferido === tipo.valor"
                  (click)="elegirTipoLugar(tipo.valor)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="iconoSeguro(tipo.icono)"></svg>
                  {{ tipo.etiqueta }}
                </button>
              </div>
            </div>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Hasta cuanto puedes pagar al mes?</span>
              <div class="grilla-presupuesto">
                <button
                  type="button"
                  *ngFor="let rango of rangosPresupuesto"
                  class="chip-seleccionable chip-con-icono"
                  [class.activo]="presupuestoMax === rango.valor"
                  (click)="elegirPresupuesto(rango.valor)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <circle cx="17" cy="15" r="1.4" fill="currentColor" stroke="none" />
                  </svg>
                  {{ rango.etiqueta }}
                </button>
              </div>
            </div>

            <label class="fila-terminos">
              <input type="checkbox" name="acepta" [(ngModel)]="aceptaTerminos" />
              <span>Acepto los terminos de uso y la politica de privacidad.</span>
            </label>

            <button type="submit" class="boton-principal boton-ancho" [disabled]="cargando">
              {{ cargando ? 'Creando cuenta...' : 'Registrarme' }}
            </button>
          </form>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>

          <div class="nota-privacidad" *ngIf="rol === 'interesado'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15v-3M12 15V9M16 15v-5" />
            </svg>
            <span>Tus respuestas sirven solo para estadisticas de vivienda.</span>
          </div>

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
  tiposLugar = TIPOS_LUGAR;
  rangosPresupuesto = RANGOS_PRESUPUESTO;
  nombre = '';
  correo = '';
  clave = '';
  celular = '';
  rol: 'interesado' | 'publicador' = 'interesado';
  perfilHogar = '';
  presupuestoMax: number | null = null;
  tipoPreferido = '';
  aceptaTerminos = false;
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
  ) {}

  iconoSeguro(svgInterno: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgInterno);
  }

  elegirPerfil(perfil: string): void {
    this.perfilHogar = this.perfilHogar === perfil ? '' : perfil;
  }

  elegirTipoLugar(tipo: string): void {
    this.tipoPreferido = this.tipoPreferido === tipo ? '' : tipo;
  }

  elegirPresupuesto(valor: number): void {
    this.presupuestoMax = this.presupuestoMax === valor ? null : valor;
  }

  enviar(): void {
    this.error = '';
    if (!this.nombre || !this.correo || !this.celular || !this.clave) {
      this.error = 'Completa todos los campos para continuar.';
      return;
    }
    if (this.clave.length < 8) {
      this.error = 'La contrasena debe tener al menos 8 caracteres.';
      return;
    }
    if (!this.aceptaTerminos) {
      this.error = 'Debes aceptar los terminos de uso y la politica de privacidad.';
      return;
    }
    this.cargando = true;
    this.authService
      .registrar({
        nombre: this.nombre,
        correo: this.correo,
        clave: this.clave,
        celular: this.celular,
        rol: this.rol,
        perfilHogar: this.rol === 'interesado' ? this.perfilHogar || undefined : undefined,
        presupuestoMax: this.rol === 'interesado' ? this.presupuestoMax || undefined : undefined,
        tipoPreferido: this.rol === 'interesado' ? this.tipoPreferido || undefined : undefined,
      })
      .subscribe({
        next: () => this.router.navigate(['/verificacion']),
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
