import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../servicios/auth.service';
import { SelectorCampoComponent } from '../../componentes/selector-campo.component';
import { OpcionSelector } from '../../componentes/selector-buscador.component';

interface Zona {
  id: number;
  nombre: string;
}

const MOTIVOS = [
  {
    valor: 'estudios',
    etiqueta: 'Estudios',
    icono: '<path d="M12 3 2 8l10 5 10-5Z" /><path d="M6 10.5V16c0 1 2.5 3 6 3s6-2 6-3v-5.5" />',
  },
  {
    valor: 'trabajo',
    etiqueta: 'Trabajo',
    icono: '<rect x="3" y="8" width="18" height="12" rx="2" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  },
  {
    valor: 'familia',
    etiqueta: 'Familia',
    icono:
      '<circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" /><path d="M13 14h2a5 5 0 0 1 5 5v1" />',
  },
  {
    valor: 'traslado_temporal',
    etiqueta: 'Traslado temporal',
    icono: '<path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" />',
  },
  {
    valor: 'otro',
    etiqueta: 'Otro',
    icono: '<circle cx="12" cy="12" r="9" /><path d="M12 16h.01M12 8v5" />',
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
  { etiqueta: 'Hasta Bs 500', valor: 'hasta_500' },
  { etiqueta: 'Bs 501 a 800', valor: '501_800' },
  { etiqueta: 'Bs 801 a 1.200', valor: '801_1200' },
  { etiqueta: 'Más de Bs 1.200', valor: 'mas_1200' },
];

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectorCampoComponent],
  template: `
    <section class="pagina-dividida">
      <div class="panel-marca">
        <div class="icono-marca">
          <img src="/assets/icono-logo.png" alt="" />
        </div>
        <h2>Vinto<span class="acento-marca">Alquiler</span></h2>
        <p>Publica gratis en minutos o encuentra tu próximo lugar cerca de la UAB y del centro de Vinto.</p>
      </div>
      <div class="panel-formulario">
        <div class="contenido-formulario">
          <a routerLink="/" class="enlace-volver">← Volver</a>
          <h1 class="titulo-registro">Crear cuenta</h1>
          <p class="subtitulo subtitulo-centrado">
            {{ rol === 'interesado' ? 'Busca alquiler en Vinto.' : 'Publica gratis tu inmueble y encuentra inquilinos en Vinto.' }}
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
              <input type="email" name="correo" placeholder="tu correo electrónico" [(ngModel)]="correo" />
            </label>
            <label>
              <span class="etiqueta">Contraseña</span>
              <div class="campo-clave">
                <input [type]="verClave ? 'text' : 'password'" name="clave" placeholder="Crea tu contraseña" [(ngModel)]="clave" />
                <button type="button" class="boton-ver-clave" (click)="verClave = !verClave" [attr.aria-label]="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  {{ verClave ? '🙈' : '👁️' }}
                </button>
              </div>
            </label>
            <label>
              <span class="etiqueta">Confirmar contraseña</span>
              <div class="campo-clave">
                <input [type]="verConfirmarClave ? 'text' : 'password'" name="confirmarClave" placeholder="Repite tu contraseña" [(ngModel)]="confirmarClave" />
                <button type="button" class="boton-ver-clave" (click)="verConfirmarClave = !verConfirmarClave" [attr.aria-label]="verConfirmarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  {{ verConfirmarClave ? '🙈' : '👁️' }}
                </button>
              </div>
            </label>
            <label>
              <span class="etiqueta">Celular / WhatsApp</span>
              <input type="tel" name="celular" placeholder="+591 7XXXXXXX" [(ngModel)]="celular" />
            </label>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Cuál es tu motivo principal de búsqueda?</span>
              <div class="chips-perfil">
                <button
                  type="button"
                  *ngFor="let motivo of motivos"
                  class="chip-seleccionable chip-con-icono"
                  [class.activo]="motivoBusqueda === motivo.valor"
                  (click)="elegirMotivo(motivo.valor)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="iconoSeguro(motivo.icono)"></svg>
                  {{ motivo.etiqueta }}
                </button>
              </div>
            </div>

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿Qué tipo de lugar buscas?</span>
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
              <span class="etiqueta">¿Hasta cuánto puedes pagar al mes?</span>
              <div class="grilla-presupuesto">
                <button
                  type="button"
                  *ngFor="let rango of rangosPresupuesto"
                  class="chip-seleccionable chip-con-icono"
                  [class.activo]="rangoPresupuesto === rango.valor"
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

            <div *ngIf="rol === 'interesado'" class="campo-perfil">
              <span class="etiqueta">¿En qué zona te interesa buscar?</span>
              <app-selector-campo name="zonaInteres" [(ngModel)]="zonaInteresId" [opciones]="opcionesZona"></app-selector-campo>
            </div>

            <label class="fila-terminos">
              <input type="checkbox" name="acepta" [(ngModel)]="aceptaTerminos" />
              <span>
                Acepto los <a routerLink="/terminos" target="_blank" (click)="$event.stopPropagation()">Términos de uso</a>
                y la <a routerLink="/privacidad" target="_blank" (click)="$event.stopPropagation()">Política de privacidad</a>.
              </span>
            </label>

            <label class="fila-terminos" *ngIf="rol === 'interesado'">
              <input type="checkbox" name="autorizaEstadistico" [(ngModel)]="autorizaUsoEstadistico" />
              <span><strong>Uso estadístico opcional:</strong> autorizo el uso de mis preferencias, de forma agregada y sin datos personales identificables, para generar estadísticas sobre vivienda en Vinto.</span>
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
            <span>Tus preferencias ayudan a personalizar tus recomendaciones. El uso estadístico agregado es opcional.</span>
          </div>

          <div class="nota-privacidad" *ngIf="rol === 'publicador'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 20 7v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7Z" /><path d="m9 12 2 2 4-4" />
            </svg>
            <span>Después de crear tu cuenta, verifica tu identidad gratis para empezar a publicar. Tus anuncios mostrarán el sello «Publicador verificado».</span>
          </div>

          <p class="pie">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
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
        font-size: 16px;
        padding: 0;
        line-height: 1;
      }
    `,
  ],
})
export class RegistroComponent implements OnInit {
  private readonly apiUrl = '/api';

  motivos = MOTIVOS;
  tiposLugar = TIPOS_LUGAR;
  rangosPresupuesto = RANGOS_PRESUPUESTO;
  zonas: Zona[] = [];
  opcionesZona: OpcionSelector<number | null>[] = [{ valor: null, texto: 'Cualquier zona' }];

  nombre = '';
  correo = '';
  clave = '';
  confirmarClave = '';
  verClave = false;
  verConfirmarClave = false;
  celular = '';
  rol: 'interesado' | 'publicador' = 'interesado';
  motivoBusqueda = '';
  tipoPreferido = '';
  rangoPresupuesto = '';
  zonaInteresId: number | null = null;
  autorizaUsoEstadistico = false;
  aceptaTerminos = false;
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => {
      this.zonas = res;
      this.opcionesZona = [{ valor: null, texto: 'Cualquier zona' }, ...res.map((zona) => ({ valor: zona.id, texto: zona.nombre }))];
    });
  }

  // Seguro: los íconos son constantes definidas en este componente, nunca contenido ingresado por usuarios.
  iconoSeguro(svgInterno: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgInterno);
  }

  elegirMotivo(motivo: string): void {
    this.motivoBusqueda = this.motivoBusqueda === motivo ? '' : motivo;
  }

  elegirTipoLugar(tipo: string): void {
    this.tipoPreferido = this.tipoPreferido === tipo ? '' : tipo;
  }

  elegirPresupuesto(valor: string): void {
    this.rangoPresupuesto = this.rangoPresupuesto === valor ? '' : valor;
  }

  enviar(): void {
    this.error = '';
    if (!this.nombre || !this.correo || !this.celular || !this.clave) {
      this.error = 'Completa todos los campos para continuar.';
      return;
    }
    if (this.clave.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.clave !== this.confirmarClave) {
      this.error = 'Las contraseñas no coinciden.';
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
        celular: this.celular.replace(/[\s()-]/g, ''),
        rol: this.rol,
        motivoBusqueda: this.rol === 'interesado' ? this.motivoBusqueda || undefined : undefined,
        tipoPreferido: this.rol === 'interesado' ? this.tipoPreferido || undefined : undefined,
        rangoPresupuesto: this.rol === 'interesado' ? this.rangoPresupuesto || undefined : undefined,
        zonaInteresId: this.rol === 'interesado' && this.zonaInteresId ? this.zonaInteresId : undefined,
        autorizaUsoEstadistico: this.rol === 'interesado' ? this.autorizaUsoEstadistico : undefined,
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
