import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VerificacionService } from '../../servicios/verificacion.service';
import { AnuncioService } from '../../servicios/anuncio.service';
import { clasificarServicios, GRUPOS_CARACTERISTICAS, SERVICIOS } from '../../utilidades/catalogo-anuncio';

interface Zona {
  id: number;
  nombre: string;
}

interface FotoSeleccionada {
  archivo: File;
  /** URL temporal solo para la vista previa; se libera al quitar la foto o salir. */
  vista: string;
}

type ModoServicio = 'no' | 'incluido' | 'aparte';

/** Mismas reglas que valida el backend (dto/reglas-anuncio.ts). */
const REGLAS = {
  tituloMin: 10,
  tituloMax: 80,
  descripcionMin: 30,
  descripcionMax: 1000,
  precioMin: 1,
  precioMax: 100000,
  fotosMax: 15,
};
const SIN_TELEFONO = /^(?![\s\S]*(?:\d[\s.-]?){7})[\s\S]*$/;
const SIN_ENLACES = /^(?![\s\S]*(?:https?:\/\/|www\.))[\s\S]*$/i;
const TITULOS_GENERICOS = ['alquiler', 'alquilo', 'casa', 'cuarto', 'garzonier', 'departamento', 'anticretico', 'se alquila'];
const FORMATOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;
// Solo para advertir en la vista previa; no bloquean la publicación.
const PRECIO_INUSUAL_BAJO = 150;
const PRECIO_INUSUAL_ALTO = 10000;

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="publicar">
      <h1>Publicar anuncio</h1>
      <div class="aviso-verificar" *ngIf="verificado === false">
        <div class="titulo-aviso-verificar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono-escudo" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h2>Verificación necesaria para publicar</h2>
        </div>
        <p>
          Para publicar un inmueble debes verificar tu identidad. Este proceso es gratuito, ayuda a reducir publicaciones falsas y
          protege a quienes buscan alquiler en Vinto. Tus anuncios mostrarán el sello «Publicador verificado».
        </p>
        <a class="boton-principal" routerLink="/verificacion">Verificar mi identidad</a>
        <details class="detalle-verificacion">
          <summary>¿Por qué debo verificar mi identidad?</summary>
          <ul>
            <li><strong>Qué se solicita:</strong> una foto del anverso y del reverso de tu Cédula de Identidad y una selfie tomada en el momento.</li>
            <li><strong>Cómo se verifica:</strong> se extraen los datos de la cédula y se compara tu rostro con la foto del documento de forma automática.</li>
            <li><strong>Cómo se protege:</strong> las imágenes se procesan en memoria y no se almacenan. Solo se guarda tu número de cédula cifrado.</li>
            <li><strong>Qué se muestra públicamente:</strong> únicamente el sello «Publicador verificado». Tu cédula y tu correo nunca son visibles para otros usuarios.</li>
            <li><strong>Si no se aprueba:</strong> puedes intentarlo hasta tres veces sin costo. Después, debes contactar a soporte para revisar tu caso.</li>
          </ul>
        </details>
      </div>

      <ng-container *ngIf="verificado">
        <!-- Paso 1: formulario por secciones -->
        <form (ngSubmit)="revisar()" *ngIf="!revisando" novalidate>
          <!-- 1. Información básica -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">1</span> Información básica</legend>
            <label>
              Zona
              <select name="zonaId" [(ngModel)]="zonaId">
                <option [ngValue]="null" disabled>Selecciona una zona</option>
                <option *ngFor="let zona of zonas" [ngValue]="zona.id">{{ zona.nombre }}</option>
              </select>
            </label>
            <label>
              Tipo de inmueble
              <select name="tipo" [(ngModel)]="tipo">
                <option value="cuarto">Cuarto</option>
                <option value="garzonier">Garzonier</option>
                <option value="departamento">Departamento</option>
              </select>
            </label>
            <label>
              Título del anuncio
              <input type="text" name="titulo" [maxlength]="reglas.tituloMax" placeholder="Ej: Garzonier amoblado cerca de la UAB" [(ngModel)]="titulo" />
              <span class="contador" [class.alerta]="errorTitulo">{{ titulo.trim().length }}/{{ reglas.tituloMax }}</span>
              <span class="error-campo" *ngIf="intentoEnviar && errorTitulo">{{ errorTitulo }}</span>
            </label>
            <label>
              Descripción
              <span class="ayuda-campo">
                Describe la distribución, el estado del inmueble y qué lo hace atractivo. Puedes mencionar reglas de convivencia
                (por ejemplo, no fumar). No agregues teléfonos ni enlaces: el contacto se realiza mediante VintoAlquiler.
              </span>
              <textarea name="descripcion" [maxlength]="reglas.descripcionMax"
                placeholder="Ej: Cuarto independiente con baño privado, a 5 minutos caminando de la UAB." [(ngModel)]="descripcion"></textarea>
              <span class="contador" [class.alerta]="errorDescripcion">{{ descripcion.trim().length }}/{{ reglas.descripcionMax }}</span>
              <span class="error-campo" *ngIf="intentoEnviar && errorDescripcion">{{ errorDescripcion }}</span>
            </label>
            <label>
              Precio mensual (Bs.)
              <input type="number" name="precio" min="1" step="1" inputmode="numeric" placeholder="Ej: 800" [(ngModel)]="precio" />
              <span class="error-campo" *ngIf="intentoEnviar && errorPrecio">{{ errorPrecio }}</span>
            </label>
          </fieldset>

          <!-- 2. Servicios -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">2</span> ¿Qué servicios incluye el alquiler?</legend>
            <p class="ayuda-campo">Indica para cada servicio si está incluido en el precio o se paga por separado. Opcional.</p>
            <div class="fila-servicio" *ngFor="let servicio of catalogoServicios">
              <span>{{ servicio.nombre }}</span>
              <div class="selector-modo" role="radiogroup" [attr.aria-label]="servicio.nombre">
                <button type="button" [class.activo]="modoServicio(servicio.codigo) === 'incluido'" (click)="cambiarServicio(servicio.codigo, 'incluido')">Incluido</button>
                <button type="button" [class.activo]="modoServicio(servicio.codigo) === 'aparte'" (click)="cambiarServicio(servicio.codigo, 'aparte')">Pago aparte</button>
                <button type="button" [class.activo]="modoServicio(servicio.codigo) === 'no'" (click)="cambiarServicio(servicio.codigo, 'no')">No aplica</button>
              </div>
            </div>
          </fieldset>

          <!-- 3. Características -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">3</span> Características del inmueble</legend>
            <p class="ayuda-campo">Marca solo lo que realmente tiene el inmueble. Opcional.</p>
            <div class="grupo-caracteristicas" *ngFor="let grupo of gruposCaracteristicas">
              <span class="titulo-grupo">{{ grupo.titulo }}</span>
              <div class="chips-seleccion">
                <button type="button" class="chip-seleccion" *ngFor="let opcion of grupo.opciones"
                  [class.activo]="caracteristicas.has(opcion.codigo)" (click)="alternarCaracteristica(opcion.codigo)"
                  [attr.aria-pressed]="caracteristicas.has(opcion.codigo)">
                  {{ opcion.nombre }}
                </button>
              </div>
            </div>
            <div class="fila-numeros">
              <label>
                Superficie aproximada (m²)
                <input type="number" name="superficieM2" min="1" step="1" inputmode="numeric" placeholder="Opcional" [(ngModel)]="superficieM2" />
              </label>
              <label>
                Ambientes
                <input type="number" name="ambientes" min="1" step="1" inputmode="numeric" placeholder="Opcional" [(ngModel)]="ambientes" />
              </label>
            </div>
          </fieldset>

          <!-- 4. Condiciones -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">4</span> Condiciones del alquiler</legend>
            <label>
              Garantía o depósito
              <span class="ayuda-campo">Lo que le pides al interesado como respaldo al firmar.</span>
              <input type="text" name="garantia" placeholder="Ej: Un mes de alquiler por adelantado" [(ngModel)]="garantia" />
            </label>
            <label>
              Plazo mínimo del contrato
              <input type="text" name="contratoMinimo" placeholder="Ej: 6 meses" [(ngModel)]="contratoMinimo" />
            </label>
          </fieldset>

          <!-- 5. Ubicación -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">5</span> Ubicación y privacidad</legend>
            <label>
              Referencia pública
              <span class="ayuda-campo">Zona o punto de referencia aproximado. Esta información se mostrará públicamente.</span>
              <input type="text" name="referencia" placeholder="Ej: A dos cuadras del Mercado de Vinto" [(ngModel)]="referencia" />
            </label>
            <label>
              Dirección exacta
              <span class="ayuda-campo aviso-privado">
                🔒 Se guarda de forma protegida y no se muestra públicamente. Solo la verán los interesados con identidad verificada.
              </span>
              <input type="text" name="direccionExacta" placeholder="Ej: Calle Bolívar #123, a media cuadra de la plaza" [(ngModel)]="direccionExacta" />
            </label>
          </fieldset>

          <!-- 6. Fotografías -->
          <fieldset class="seccion">
            <legend><span class="numero-seccion">6</span> Fotografías del inmueble</legend>
            <p class="ayuda-campo">
              Puedes cargar hasta {{ reglas.fotosMax }} imágenes en el plan gratuito; la portada cuenta dentro del límite.
              JPG, PNG o WebP de máximo 5 MB. Sube fotografías reales del inmueble: no uses documentos, diagramas,
              capturas de pantalla ni imágenes de internet.
            </p>

            <span class="titulo-grupo">Fotografía de portada</span>
            <div class="caja-portada" *ngIf="fotos.length; else sinPortada">
              <img [src]="fotos[0].vista" alt="Portada del anuncio" />
              <span class="etiqueta-portada">Portada</span>
              <button type="button" class="quitar-portada" (click)="quitarFoto(0)" title="Quitar portada">✕</button>
            </div>
            <ng-template #sinPortada>
              <label class="caja-portada vacia">
                <span>+ Agregar portada</span>
                <small>Es la foto principal que verán primero</small>
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden (change)="agregarFotos($event)" />
              </label>
            </ng-template>

            <ng-container *ngIf="fotos.length">
              <span class="titulo-grupo">Fotos adicionales ({{ fotos.length - 1 }} de {{ reglas.fotosMax - 1 }})</span>
              <div class="miniaturas">
                <div class="miniatura" *ngFor="let foto of fotosAdicionales; let j = index">
                  <img [src]="foto.vista" [alt]="'Foto adicional ' + (j + 1)" />
                  <div class="acciones-miniatura">
                    <button type="button" (click)="hacerPortada(j + 1)" title="Usar como portada">★</button>
                    <button type="button" *ngIf="j > 0" (click)="mover(j + 1, -1)" title="Mover a la izquierda">‹</button>
                    <button type="button" *ngIf="j < fotosAdicionales.length - 1" (click)="mover(j + 1, 1)" title="Mover a la derecha">›</button>
                    <button type="button" (click)="quitarFoto(j + 1)" title="Quitar foto">✕</button>
                  </div>
                </div>
                <label class="miniatura agregar" *ngIf="fotos.length < reglas.fotosMax">
                  <span>+ Agregar fotos</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden (change)="agregarFotos($event)" />
                </label>
              </div>
            </ng-container>
            <span class="contador-total">{{ fotos.length }} de {{ reglas.fotosMax }} imágenes</span>
            <span class="error-campo" *ngIf="avisoFotos">{{ avisoFotos }}</span>
          </fieldset>

          <p class="motivo-deshabilitado" *ngIf="!formularioCompleto">
            Completa los campos obligatorios de las secciones 1, 4 y 5 y agrega una foto de portada para continuar.
          </p>
          <button type="submit" class="boton-principal" [disabled]="!formularioCompleto">Revisar anuncio</button>
        </form>

        <!-- Paso 2: vista previa antes de publicar -->
        <div class="resumen-publicacion" *ngIf="revisando">
          <h2>Revisa tu anuncio antes de publicarlo</h2>
          <div class="tarjeta tarjeta-resumen">
            <img [src]="fotos[0].vista" alt="Foto de portada" class="portada-resumen" />
            <div class="galeria-resumen" *ngIf="fotos.length > 1">
              <img *ngFor="let foto of fotosAdicionales" [src]="foto.vista" alt="" />
            </div>
            <div class="cuerpo-resumen">
              <span class="insignia-estado-verificado">✓ Publicador verificado</span>
              <h3>{{ titulo.trim() }}</h3>
              <p class="texto-suave">{{ etiquetaTipo }} · {{ nombreZona }}</p>
              <p class="precio">Bs. {{ precio | number: '1.0-0' }}/mes</p>
              <p class="texto-suave">📍 {{ referencia.trim() }}</p>
              <p class="descripcion-resumen">{{ descripcion.trim() }}</p>

              <ng-container *ngIf="resumenServicios as r">
                <p *ngIf="r.incluidos.length"><strong>Incluye:</strong> {{ r.incluidos.join(', ') }}</p>
                <p *ngIf="r.aparte.length"><strong>Se paga aparte:</strong> {{ r.aparte.join(', ') }}</p>
                <p *ngIf="r.caracteristicas.length"><strong>Características:</strong> {{ r.caracteristicas.join(', ') }}</p>
              </ng-container>
              <p *ngIf="superficieM2 || ambientes" class="texto-suave">
                <span *ngIf="superficieM2">{{ superficieM2 }} m²</span>
                <span *ngIf="superficieM2 && ambientes"> · </span>
                <span *ngIf="ambientes">{{ ambientes }} {{ ambientes === 1 ? 'ambiente' : 'ambientes' }}</span>
              </p>
              <p><strong>Garantía:</strong> {{ garantia.trim() }} · <strong>Contrato mínimo:</strong> {{ contratoMinimo.trim() }}</p>
            </div>
          </div>
          <p class="aviso-precio" *ngIf="precioInusual">
            El precio de Bs. {{ precio | number: '1.0-0' }}/mes parece inusual para un alquiler en Vinto. Revisa que esté bien escrito.
          </p>
          <p class="aviso-privado">🔒 La dirección exacta no será pública.</p>
          <div class="acciones-resumen">
            <button type="button" class="boton-secundario" (click)="revisando = false" [disabled]="enviando">Editar datos</button>
            <button type="button" class="boton-principal" (click)="enviar()" [disabled]="enviando">
              {{ enviando ? 'Publicando...' : 'Confirmar y publicar' }}
            </button>
          </div>
        </div>
      </ng-container>
      <p class="mensaje-error" *ngIf="error">{{ error }}</p>
    </section>
  `,
  styles: [
    `
      .aviso-verificar {
        max-width: 560px; margin: 16px auto 0; background: #fff; border: 1px solid var(--borde, #ECE1D2);
        border-radius: 18px; padding: 28px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;
      }
      .aviso-verificar h2 { margin: 0; font-size: 19px; }
      .aviso-verificar p { margin: 0 0 6px; }
      .titulo-aviso-verificar { display: flex; align-items: center; gap: 8px; }
      .icono-escudo { width: 26px; height: 26px; color: var(--acento-oscuro); flex-shrink: 0; }
      .detalle-verificacion { width: 100%; text-align: left; margin-top: 6px; font-size: 13.5px; }
      .detalle-verificacion summary { cursor: pointer; color: var(--acento-oscuro); font-weight: 600; text-align: center; }
      .detalle-verificacion ul { margin: 10px 0 0; padding-left: 18px; line-height: 1.55; }
      .detalle-verificacion li { margin-bottom: 6px; }
      @media (max-width: 560px) { .aviso-verificar { padding: 20px 16px; } }

      .publicar { max-width: 660px; margin: 0 auto; padding: 24px 20px 60px; }
      form, .resumen-publicacion { display: flex; flex-direction: column; gap: 18px; }
      .seccion {
        border: 1px solid var(--borde, #ECE1D2); border-radius: 16px; background: #fff;
        padding: 18px 18px 20px; margin: 0; display: flex; flex-direction: column; gap: 16px; min-width: 0;
      }
      .seccion legend { font: 700 16px 'Bricolage Grotesque', sans-serif; padding: 0 6px; display: flex; align-items: center; gap: 8px; }
      .numero-seccion {
        width: 24px; height: 24px; border-radius: 50%; background: var(--acento); color: #fff;
        display: inline-flex; align-items: center; justify-content: center; font-size: 13px;
      }
      label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; font-size: 0.9rem; }
      .ayuda-campo { font-weight: 400; font-size: 0.8rem; color: var(--texto-suave, #67717B); margin: 0; }
      .aviso-privado { font-weight: 400; font-size: 0.8rem; color: #1F6B3A; margin: 0; }
      input, select, textarea { font-weight: 400; }
      textarea { min-height: 110px; }
      .contador { align-self: flex-end; font-weight: 400; font-size: 0.75rem; color: var(--texto-suave); }
      .contador.alerta { color: #8A5A12; }
      .error-campo { font-weight: 500; font-size: 0.8rem; color: var(--rojo, #B42318); }

      .fila-servicio { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 0.9rem; }
      .selector-modo { display: inline-flex; border: 1px solid var(--borde); border-radius: 999px; overflow: hidden; }
      .selector-modo button { border: none; background: #fff; padding: 6px 12px; font-size: 12.5px; cursor: pointer; color: var(--texto-suave); }
      .selector-modo button + button { border-left: 1px solid var(--borde); }
      .selector-modo button.activo { background: var(--acento); color: #fff; font-weight: 700; }

      .titulo-grupo { font-weight: 700; font-size: 0.85rem; }
      .grupo-caracteristicas { display: flex; flex-direction: column; gap: 8px; }
      .chips-seleccion { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip-seleccion {
        border: 1.5px solid var(--borde-fuerte, #D9CBB6); background: #fff; border-radius: 999px;
        padding: 6px 12px; font-size: 13px; cursor: pointer;
      }
      .chip-seleccion.activo { border-color: var(--acento); background: var(--superficie-alt, #F7EFE3); color: var(--acento-oscuro); font-weight: 700; }
      .fila-numeros { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

      .caja-portada {
        position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden;
        border: 2px solid var(--acento); background: #F3ECE0;
      }
      .caja-portada img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .caja-portada.vacia {
        border-style: dashed; display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 4px; cursor: pointer; color: var(--acento-oscuro);
      }
      .caja-portada.vacia small { font-weight: 400; color: var(--texto-suave); }
      .etiqueta-portada {
        position: absolute; top: 8px; left: 8px; background: var(--acento); color: #fff;
        font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
      }
      .quitar-portada {
        position: absolute; top: 8px; right: 8px; border: none; border-radius: 50%; width: 30px; height: 30px;
        background: rgba(0, 0, 0, 0.55); color: #fff; cursor: pointer;
      }
      .miniaturas { display: flex; flex-wrap: wrap; gap: 10px; }
      .miniatura { position: relative; width: 110px; border-radius: 10px; overflow: hidden; border: 1px solid var(--borde); }
      .miniatura img { width: 100%; height: 85px; object-fit: cover; display: block; }
      .miniatura.agregar {
        height: 112px; border-style: dashed; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--acento-oscuro); font-size: 13px;
      }
      .acciones-miniatura { display: flex; background: #F7EFE3; }
      .acciones-miniatura button { flex: 1; border: none; background: none; cursor: pointer; padding: 4px 0; font-size: 13px; }
      .acciones-miniatura button:hover { background: #EEDFC9; }
      .contador-total { font-size: 0.8rem; color: var(--texto-suave); }
      .motivo-deshabilitado { margin: 0; font-size: 0.85rem; color: var(--texto-suave); }

      .resumen-publicacion h2 { margin: 0; }
      .tarjeta-resumen { padding: 0; }
      .portada-resumen { width: 100%; height: 240px; object-fit: cover; display: block; }
      .galeria-resumen { display: flex; gap: 6px; overflow-x: auto; padding: 6px; }
      .galeria-resumen img { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
      .cuerpo-resumen { padding: 12px 18px 18px; }
      .cuerpo-resumen h3 { margin: 8px 0 4px; }
      .cuerpo-resumen p { margin: 4px 0; }
      .descripcion-resumen { line-height: 1.55; }
      .insignia-estado-verificado { background: #3E8E5B; color: #fff; font: 700 11.5px 'Manrope', sans-serif; padding: 4px 10px; border-radius: 999px; }
      .aviso-precio { margin: 0; padding: 10px 14px; border-radius: 12px; background: #FBF1E3; color: #8A5A12; font-size: 0.9rem; }
      .acciones-resumen { display: flex; gap: 12px; flex-wrap: wrap; }
      @media (max-width: 560px) {
        .fila-servicio { flex-direction: column; align-items: flex-start; }
        .fila-numeros { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class PublicarComponent implements OnInit, OnDestroy {
  readonly reglas = REGLAS;
  readonly catalogoServicios = SERVICIOS;
  readonly gruposCaracteristicas = GRUPOS_CARACTERISTICAS;
  private readonly apiUrl = '/api';
  zonas: Zona[] = [];
  zonaId: number | null = null;
  tipo = 'cuarto';
  titulo = '';
  descripcion = '';
  precio: number | null = null;
  servicios: Record<string, ModoServicio> = {};
  caracteristicas = new Set<string>();
  superficieM2: number | null = null;
  ambientes: number | null = null;
  referencia = '';
  direccionExacta = '';
  garantia = '';
  contratoMinimo = '';
  fotos: FotoSeleccionada[] = [];
  avisoFotos = '';
  error = '';
  enviando = false;
  revisando = false;
  intentoEnviar = false;
  verificado: boolean | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly anuncioService: AnuncioService,
    private readonly router: Router,
    private readonly verificacionService: VerificacionService,
  ) {}

  ngOnInit(): void {
    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => (this.zonas = res));
    this.verificacionService.estado().subscribe({
      next: (res) => (this.verificado = res.verificado),
      error: () => (this.verificado = false),
    });
  }

  ngOnDestroy(): void {
    this.fotos.forEach((foto) => URL.revokeObjectURL(foto.vista));
  }

  get errorTitulo(): string {
    const largo = this.titulo.trim().length;
    if (largo < REGLAS.tituloMin) return `El título debe tener al menos ${REGLAS.tituloMin} caracteres. Ej: «Garzonier amoblado cerca de la UAB».`;
    if (TITULOS_GENERICOS.includes(this.titulo.trim().toLowerCase())) return 'Usa un título más descriptivo, por ejemplo «Cuarto amoblado cerca de la UAB».';
    return '';
  }

  get errorDescripcion(): string {
    const texto = this.descripcion.trim();
    if (texto.length < REGLAS.descripcionMin) return `La descripción debe tener al menos ${REGLAS.descripcionMin} caracteres.`;
    if (!SIN_TELEFONO.test(texto)) return 'No incluyas números de teléfono: las personas interesadas te contactan desde la plataforma.';
    if (!SIN_ENLACES.test(texto)) return 'No incluyas enlaces externos en la descripción.';
    return '';
  }

  get errorPrecio(): string {
    const precio = Number(this.precio);
    if (!this.precio || !Number.isFinite(precio) || precio < REGLAS.precioMin || precio > REGLAS.precioMax) {
      return 'Ingresa un precio mensual válido en bolivianos.';
    }
    return '';
  }

  get formularioCompleto(): boolean {
    return (
      !!this.zonaId &&
      !this.errorTitulo &&
      !this.errorDescripcion &&
      !this.errorPrecio &&
      this.referencia.trim().length >= 3 &&
      this.direccionExacta.trim().length >= 3 &&
      this.garantia.trim().length >= 2 &&
      this.contratoMinimo.trim().length >= 2 &&
      this.fotos.length >= 1
    );
  }

  get precioInusual(): boolean {
    const precio = Number(this.precio);
    return precio < PRECIO_INUSUAL_BAJO || precio > PRECIO_INUSUAL_ALTO;
  }

  get nombreZona(): string {
    return this.zonas.find((zona) => zona.id === this.zonaId)?.nombre ?? '';
  }

  get etiquetaTipo(): string {
    return { cuarto: 'Cuarto', garzonier: 'Garzonier', departamento: 'Departamento' }[this.tipo] ?? this.tipo;
  }

  get fotosAdicionales(): FotoSeleccionada[] {
    return this.fotos.slice(1);
  }

  /** Valores para la columna `servicios`: servicios ("agua" / "luz:aparte") y características. */
  get valoresServicios(): string[] {
    const servicios = Object.entries(this.servicios)
      .filter(([, modo]) => modo !== 'no')
      .map(([codigo, modo]) => (modo === 'aparte' ? `${codigo}:aparte` : codigo));
    return [...servicios, ...this.caracteristicas];
  }

  get resumenServicios() {
    return clasificarServicios(this.valoresServicios);
  }

  modoServicio(codigo: string): ModoServicio {
    return this.servicios[codigo] ?? 'no';
  }

  cambiarServicio(codigo: string, modo: ModoServicio): void {
    this.servicios = { ...this.servicios, [codigo]: modo };
  }

  alternarCaracteristica(codigo: string): void {
    if (this.caracteristicas.has(codigo)) this.caracteristicas.delete(codigo);
    else this.caracteristicas.add(codigo);
  }

  agregarFotos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivos = input.files ? Array.from(input.files) : [];
    input.value = '';
    this.avisoFotos = '';

    const rechazadas: string[] = [];
    for (const archivo of archivos) {
      if (this.fotos.length >= REGLAS.fotosMax) {
        rechazadas.push(`solo se permiten ${REGLAS.fotosMax} imágenes en el plan gratuito`);
        break;
      }
      if (!FORMATOS_FOTO.includes(archivo.type)) {
        rechazadas.push(`«${archivo.name}» no es JPG, PNG ni WebP`);
        continue;
      }
      if (archivo.size > TAMANO_MAXIMO_FOTO) {
        rechazadas.push(`«${archivo.name}» pesa más de 5 MB`);
        continue;
      }
      this.fotos.push({ archivo, vista: URL.createObjectURL(archivo) });
    }
    if (rechazadas.length) this.avisoFotos = `No se agregaron algunas fotos: ${rechazadas.join('; ')}.`;
  }

  /** Si se quita la portada, la siguiente foto pasa a ser la portada. */
  quitarFoto(indice: number): void {
    URL.revokeObjectURL(this.fotos[indice].vista);
    this.fotos.splice(indice, 1);
  }

  /** Intercambia: la foto elegida pasa a portada y la portada anterior queda como adicional. */
  hacerPortada(indice: number): void {
    [this.fotos[0], this.fotos[indice]] = [this.fotos[indice], this.fotos[0]];
  }

  mover(indice: number, direccion: -1 | 1): void {
    const destino = indice + direccion;
    if (destino < 1 || destino >= this.fotos.length) return;
    [this.fotos[indice], this.fotos[destino]] = [this.fotos[destino], this.fotos[indice]];
  }

  revisar(): void {
    this.intentoEnviar = true;
    if (!this.formularioCompleto) return;
    this.error = '';
    this.revisando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  enviar(): void {
    if (!this.zonaId || !this.formularioCompleto) return;
    this.error = '';
    this.enviando = true;
    this.anuncioService
      .crear({
        zonaId: this.zonaId,
        tipo: this.tipo,
        titulo: this.titulo.trim(),
        descripcion: this.descripcion.trim(),
        precio: Number(this.precio),
        servicios: this.valoresServicios,
        superficieM2: this.superficieM2 ? Math.round(Number(this.superficieM2)) : undefined,
        ambientes: this.ambientes ? Math.round(Number(this.ambientes)) : undefined,
        referencia: this.referencia.trim(),
        direccionExacta: this.direccionExacta.trim(),
        garantia: this.garantia.trim(),
        contratoMinimo: this.contratoMinimo.trim(),
      } as any)
      .subscribe({
        next: (anuncio) => {
          // Las fotos se suben en el orden elegido: la primera queda como portada.
          this.anuncioService.subirFotos(anuncio.id, this.fotos.map((foto) => foto.archivo)).subscribe({
            next: () => this.router.navigate(['/mis-anuncios']),
            error: (err) => {
              this.enviando = false;
              this.error =
                err?.error?.message ||
                'El anuncio se publicó, pero no se pudieron subir las fotos. Intenta subirlas de nuevo desde Mis anuncios.';
            },
          });
        },
        error: (err) => {
          this.enviando = false;
          this.revisando = false;
          const mensaje = err?.error?.message;
          this.error = Array.isArray(mensaje) ? mensaje.join(' ') : mensaje || 'No se pudo publicar el anuncio.';
        },
      });
  }
}
