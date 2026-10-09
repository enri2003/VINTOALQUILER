import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VerificacionService } from '../../servicios/verificacion.service';
import { AnuncioService } from '../../servicios/anuncio.service';

interface Zona {
  id: number;
  nombre: string;
}

interface FotoSeleccionada {
  archivo: File;
  /** URL temporal solo para la vista previa; se libera al quitar la foto o salir. */
  vista: string;
}

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
// Solo para advertir en el resumen; no bloquean la publicación.
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
        <!-- Paso 1: formulario -->
        <form (ngSubmit)="revisar()" *ngIf="!revisando" novalidate>
          <p class="texto-suave nota-obligatorios">Todos los campos son obligatorios.</p>

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
            <span class="ayuda-campo">Cuenta cómo es el lugar, qué incluye y qué lo hace atractivo. No incluyas teléfonos ni enlaces: te contactarán desde la plataforma.</span>
            <textarea
              name="descripcion"
              [maxlength]="reglas.descripcionMax"
              placeholder="Ej: Cuarto independiente con baño privado, agua caliente incluida, a 5 minutos caminando de la UAB."
              [(ngModel)]="descripcion"
            ></textarea>
            <span class="contador" [class.alerta]="errorDescripcion">{{ descripcion.trim().length }}/{{ reglas.descripcionMax }}</span>
            <span class="error-campo" *ngIf="intentoEnviar && errorDescripcion">{{ errorDescripcion }}</span>
          </label>

          <label>
            Precio mensual (Bs.)
            <input type="number" name="precio" min="1" step="1" inputmode="numeric" placeholder="Ej: 800" [(ngModel)]="precio" />
            <span class="error-campo" *ngIf="intentoEnviar && errorPrecio">{{ errorPrecio }}</span>
          </label>

          <label>
            Referencia de ubicación
            <span class="ayuda-campo">Una zona o punto de referencia aproximado. Esto sí es público.</span>
            <input type="text" name="referencia" placeholder="Ej: A 2 cuadras del mercado de Vinto" [(ngModel)]="referencia" />
          </label>

          <label>
            Dirección exacta
            <span class="ayuda-campo aviso-privado">
              🔒 Se guarda de forma protegida y no se muestra públicamente. Solo la verán los interesados con identidad verificada.
            </span>
            <input type="text" name="direccionExacta" placeholder="Ej: Calle Bolívar #123, a media cuadra de la plaza" [(ngModel)]="direccionExacta" />
          </label>

          <label>
            Garantía o depósito
            <span class="ayuda-campo">Lo que le pides al interesado como respaldo al firmar.</span>
            <input type="text" name="garantia" placeholder="Ej: Un mes de alquiler por adelantado" [(ngModel)]="garantia" />
          </label>

          <label>
            Plazo mínimo del contrato
            <input type="text" name="contratoMinimo" placeholder="Ej: 6 meses" [(ngModel)]="contratoMinimo" />
          </label>

          <div class="campo-fotos">
            <span class="etiqueta-fotos">Fotos ({{ fotos.length }} de {{ reglas.fotosMax }} en el plan gratuito)</span>
            <span class="ayuda-campo">
              Mínimo 1 foto. JPG, PNG o WebP, máximo 5 MB cada una. Sube fotografías reales del inmueble: no se permiten documentos,
              diagramas, capturas de pantalla ni imágenes que no correspondan al anuncio. La primera foto es la portada.
            </span>
            <div class="miniaturas" *ngIf="fotos.length">
              <div class="miniatura" *ngFor="let foto of fotos; let i = index" [class.portada]="i === 0">
                <img [src]="foto.vista" [alt]="'Foto ' + (i + 1)" />
                <span class="etiqueta-portada" *ngIf="i === 0">Portada</span>
                <div class="acciones-miniatura">
                  <button type="button" *ngIf="i !== 0" (click)="hacerPortada(i)" title="Usar como portada">★</button>
                  <button type="button" *ngIf="i > 0" (click)="mover(i, -1)" title="Mover a la izquierda">‹</button>
                  <button type="button" *ngIf="i < fotos.length - 1" (click)="mover(i, 1)" title="Mover a la derecha">›</button>
                  <button type="button" (click)="quitarFoto(i)" title="Quitar foto">✕</button>
                </div>
              </div>
            </div>
            <label class="boton-secundario boton-agregar-fotos" *ngIf="fotos.length < reglas.fotosMax">
              + Agregar fotos
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden (change)="agregarFotos($event)" />
            </label>
            <span class="error-campo" *ngIf="avisoFotos">{{ avisoFotos }}</span>
          </div>

          <p class="motivo-deshabilitado" *ngIf="!formularioCompleto">
            Completa los campos obligatorios y agrega al menos una fotografía para publicar.
          </p>
          <button type="submit" class="boton-principal" [disabled]="!formularioCompleto">Revisar anuncio</button>
        </form>

        <!-- Paso 2: resumen antes de publicar -->
        <div class="resumen-publicacion" *ngIf="revisando">
          <h2>Revisa tu anuncio antes de publicarlo</h2>
          <div class="tarjeta tarjeta-resumen">
            <img [src]="fotos[0].vista" alt="Foto de portada" class="portada-resumen" />
            <h3>{{ titulo.trim() }}</h3>
            <p class="texto-suave">{{ etiquetaTipo }} · {{ nombreZona }}</p>
            <p class="precio">Bs. {{ precio | number: '1.0-0' }}/mes</p>
            <p class="texto-suave">📍 {{ referencia.trim() }}</p>
            <p class="texto-suave">{{ fotos.length }} {{ fotos.length === 1 ? 'foto' : 'fotos' }}</p>
          </div>
          <p class="aviso-precio" *ngIf="precioInusual">
            El precio de Bs. {{ precio | number: '1.0-0' }}/mes parece inusual para un alquiler en Vinto. Revisa que esté bien escrito.
          </p>
          <p class="aviso-privado">🔒 La dirección exacta no aparecerá en el anuncio público.</p>
          <div class="acciones-resumen">
            <button type="button" class="boton-secundario" (click)="revisando = false" [disabled]="enviando">Volver a editar</button>
            <button type="button" class="boton-principal" (click)="enviar()" [disabled]="enviando">
              {{ enviando ? 'Publicando...' : 'Publicar anuncio' }}
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
        max-width: 560px;
        margin: 16px auto 0;
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 18px;
        padding: 28px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .aviso-verificar h2 { margin: 0; font-size: 19px; }
      .aviso-verificar p { margin: 0 0 6px; }
      .titulo-aviso-verificar { display: flex; align-items: center; gap: 8px; }
      .icono-escudo { width: 26px; height: 26px; color: var(--acento-oscuro); flex-shrink: 0; }
      .detalle-verificacion { width: 100%; text-align: left; margin-top: 6px; font-size: 13.5px; }
      .detalle-verificacion summary { cursor: pointer; color: var(--acento-oscuro); font-weight: 600; text-align: center; }
      .detalle-verificacion ul { margin: 10px 0 0; padding-left: 18px; line-height: 1.55; }
      .detalle-verificacion li { margin-bottom: 6px; }
      @media (max-width: 560px) {
        .aviso-verificar { padding: 20px 16px; }
      }
      .publicar { max-width: 600px; margin: 0 auto; padding: 24px 20px 60px; }
      form, .resumen-publicacion {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      label, .campo-fotos {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .ayuda-campo {
        font-weight: 400;
        font-size: 0.8rem;
        color: var(--texto-suave, #67717B);
      }
      .aviso-privado { font-weight: 400; font-size: 0.8rem; color: #1F6B3A; }
      input, select, textarea { font-weight: 400; }
      textarea { min-height: 110px; }
      .nota-obligatorios { margin: 0; font-size: 0.85rem; }
      .contador { align-self: flex-end; font-weight: 400; font-size: 0.75rem; color: var(--texto-suave); }
      .contador.alerta { color: #8A5A12; }
      .error-campo { font-weight: 500; font-size: 0.8rem; color: var(--rojo, #B42318); }
      .miniaturas { display: flex; flex-wrap: wrap; gap: 10px; margin: 6px 0; }
      .miniatura { position: relative; width: 110px; border-radius: 10px; overflow: hidden; border: 2px solid transparent; }
      .miniatura.portada { border-color: var(--acento); }
      .miniatura img { width: 100%; height: 85px; object-fit: cover; display: block; }
      .etiqueta-portada {
        position: absolute; top: 4px; left: 4px; background: var(--acento); color: #fff;
        font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
      }
      .acciones-miniatura { display: flex; justify-content: space-between; background: #F7EFE3; }
      .acciones-miniatura button { flex: 1; border: none; background: none; cursor: pointer; padding: 4px 0; font-size: 13px; }
      .acciones-miniatura button:hover { background: #EEDFC9; }
      .boton-agregar-fotos { align-self: flex-start; cursor: pointer; font-weight: 600; }
      .motivo-deshabilitado { margin: 0; font-size: 0.85rem; color: var(--texto-suave); }
      .resumen-publicacion h2 { margin: 0; }
      .tarjeta-resumen { padding: 0 0 16px; }
      .tarjeta-resumen > *:not(img) { margin-left: 18px; margin-right: 18px; }
      .portada-resumen { width: 100%; height: 220px; object-fit: cover; display: block; margin-bottom: 12px; }
      .tarjeta-resumen h3 { margin-top: 0; margin-bottom: 4px; }
      .tarjeta-resumen p { margin-top: 2px; margin-bottom: 2px; }
      .aviso-precio { margin: 0; padding: 10px 14px; border-radius: 12px; background: #FBF1E3; color: #8A5A12; font-size: 0.9rem; }
      .acciones-resumen { display: flex; gap: 12px; flex-wrap: wrap; }
    `,
  ],
})
export class PublicarComponent implements OnInit, OnDestroy {
  readonly reglas = REGLAS;
  private readonly apiUrl = '/api';
  zonas: Zona[] = [];
  zonaId: number | null = null;
  tipo = 'cuarto';
  titulo = '';
  descripcion = '';
  precio: number | null = null;
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

  agregarFotos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivos = input.files ? Array.from(input.files) : [];
    input.value = '';
    this.avisoFotos = '';

    const rechazadas: string[] = [];
    for (const archivo of archivos) {
      if (this.fotos.length >= REGLAS.fotosMax) {
        rechazadas.push(`solo se permiten ${REGLAS.fotosMax} fotos en el plan gratuito`);
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

  quitarFoto(indice: number): void {
    URL.revokeObjectURL(this.fotos[indice].vista);
    this.fotos.splice(indice, 1);
  }

  hacerPortada(indice: number): void {
    const [foto] = this.fotos.splice(indice, 1);
    this.fotos.unshift(foto);
  }

  mover(indice: number, direccion: -1 | 1): void {
    const destino = indice + direccion;
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
