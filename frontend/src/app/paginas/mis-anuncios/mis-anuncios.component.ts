import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';
import { Impulso, ImpulsoService, PlanImpulsoInfo } from '../../servicios/impulso.service';
import { VerificacionService } from '../../servicios/verificacion.service';
import { obtenerSelloImpulso } from '../../utilidades/sello-impulso.util';

const ETIQUETAS_ESTADO: Record<string, string> = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  pausado: 'Pausado',
};

@Component({
  selector: 'app-mis-anuncios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="mis-anuncios">
      <div class="cabecera-mis-anuncios">
        <h1>Mis anuncios</h1>
        <a routerLink="/publicar" class="boton-principal" *ngIf="verificado">+ Publicar aviso</a>
      </div>

      <div class="aviso-verificar-publicador" *ngIf="verificado === false">
        <strong>Identidad pendiente</strong>
        <p>
          Para publicar anuncios debes verificar tu identidad. La verificación es gratuita, ayuda a generar confianza entre quienes
          buscan y ofrecen alquileres, y permitirá que tus anuncios muestren el sello «Publicador verificado».
        </p>
        <a routerLink="/verificacion" class="boton-principal">Verificar mi identidad</a>
        <p class="nota-datos">
          La verificación solo se usa para confirmar tu identidad. Tu cédula y tu correo no se muestran públicamente en los anuncios.
        </p>
        <div class="beneficios-verificacion">
          <strong>¿Por qué verificar tu identidad?</strong>
          <ul>
            <li>Tus anuncios muestran el sello «Publicador verificado».</li>
            <li>Aumenta la confianza de las personas interesadas.</li>
            <li>Ayuda a reducir los anuncios falsos en la plataforma.</li>
          </ul>
        </div>
      </div>

      <div class="resumen-publicador" *ngIf="anuncios.length">
        <div><span>Disponibles</span><strong>{{ contar('disponible') }}</strong></div>
        <div><span>Ocupados</span><strong>{{ contar('ocupado') }}</strong></div>
        <div><span>Pausados</span><strong>{{ contar('pausado') }}</strong></div>
      </div>

      <div *ngFor="let anuncio of anuncios" class="tarjeta tarjeta-publicador">
        <div class="cuerpo-publicador">
          <div class="foto-publicador">
            <img *ngIf="anuncio.fotos.length" [src]="anuncio.fotos[0].url" [alt]="'Foto de ' + anuncio.titulo" />
            <span *ngIf="!anuncio.fotos.length">Sin fotografía</span>
          </div>
          <div class="datos-publicador">
            <h2>{{ anuncio.titulo }}</h2>
            <p class="texto-suave">
              <span class="tipo-anuncio">{{ anuncio.tipo }}</span> · {{ anuncio.zona?.nombre }} ·
              <strong class="precio-linea">Bs. {{ anuncio.precio | number: '1.0-0' }}/mes</strong>
            </p>
            <div class="etiquetas-estado">
              <span class="estado-anuncio" [ngClass]="'estado-' + anuncio.estado">{{ etiquetaEstado(anuncio.estado) }}</span>
              <span class="insignia-sello" *ngIf="sello(anuncio) as s" [ngClass]="s.clase">{{ s.texto }}</span>
            </div>
            <p class="texto-suave fechas-anuncio">
              <span *ngIf="anuncio.creadoEn">Publicado: {{ anuncio.creadoEn | date: 'd MMM y' }}</span>
              <span *ngIf="anuncio.venceEn"> · Vence por inactividad: {{ anuncio.venceEn | date: 'd MMM y' }}</span>
            </p>
            <p class="aviso-fotos" *ngIf="!anuncio.fotos.length">Agrega fotografías para mejorar la presentación de tu anuncio.</p>
          </div>
        </div>

        <p class="texto-suave" *ngIf="impulsoActivo(anuncio.id) as impulso">
          Impulso de {{ impulso.plan }} días ·
          {{ impulso.estado === 'pendiente' ? 'Pendiente de confirmación (se activa el mismo día hábil tras validar el pago)' : impulso.estado }}
        </p>
        <p class="mensaje-error" *ngIf="impulsoRechazado(anuncio.id) as rechazado">
          Impulso rechazado: {{ rechazado.motivoRechazo }}. Puedes intentar de nuevo con otro comprobante.
        </p>

        <div class="acciones">
          <a [routerLink]="['/anuncio', anuncio.id]" class="boton-principal">Ver anuncio</a>
          <button class="boton-secundario" (click)="alternarEdicion(anuncio)">
            {{ anuncioEditando === anuncio.id ? 'Cancelar edición' : 'Editar' }}
          </button>
          <button class="boton-secundario" (click)="alternarFotos(anuncio.id)">
            {{ gestionFotosAbierta === anuncio.id ? 'Cerrar fotos' : 'Gestionar fotos' }} ({{ anuncio.fotos.length }}/{{ anuncio.fotosMax || 15 }})
          </button>
          <button class="boton-secundario" (click)="alternarOcupado(anuncio)">
            {{ anuncio.estado === 'ocupado' ? 'Marcar disponible' : 'Marcar ocupado' }}
          </button>
          <button class="boton-texto-peligro" (click)="eliminar(anuncio)">Eliminar</button>
        </div>
        <div class="accion-impulso" *ngIf="!impulsoActivo(anuncio.id)">
          <button class="boton-impulso" (click)="alternarFormulario(anuncio.id)">
            {{ formularioAbierto === anuncio.id ? 'Cancelar' : 'Impulsar anuncio' }}
          </button>
        </div>

        <div class="formulario-edicion" *ngIf="anuncioEditando === anuncio.id">
          <input type="text" [(ngModel)]="edicionTitulo" placeholder="Título" />
          <input type="number" [(ngModel)]="edicionPrecio" placeholder="Precio mensual en bolivianos" />
          <textarea [(ngModel)]="edicionDescripcion" placeholder="Descripción"></textarea>
          <button class="boton-secundario" (click)="guardarEdicion(anuncio)">Guardar cambios</button>
          <p class="mensaje-error" *ngIf="errorEdicion">{{ errorEdicion }}</p>
        </div>

        <div class="gestion-fotos" *ngIf="gestionFotosAbierta === anuncio.id">
          <div class="miniaturas-fotos">
            <div class="miniatura" *ngFor="let foto of anuncio.fotos">
              <img [src]="foto.url" alt="" />
              <button class="boton-quitar-foto" (click)="eliminarFoto(anuncio, foto.id)">Eliminar</button>
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            [disabled]="anuncio.fotos.length >= (anuncio.fotosMax || 15)"
            (change)="seleccionarFotosNuevas($event)"
          />
          <button
            class="boton-secundario"
            [disabled]="!fotosNuevas.length || subiendoFotos"
            (click)="subirFotosNuevas(anuncio)"
          >
            {{ subiendoFotos ? 'Subiendo...' : 'Agregar fotos' }}
          </button>
          <p class="mensaje-error" *ngIf="errorFotos">{{ errorFotos }}</p>
        </div>

        <div class="formulario-impulso" *ngIf="formularioAbierto === anuncio.id">
          <div *ngFor="let clave of planesClaves" class="opcion-plan">
            <label>
              <input type="radio" name="plan-{{ anuncio.id }}" [value]="clave" [(ngModel)]="planSeleccionado" />
              {{ clave }} días - Bs. {{ planes[clave].precio }} ({{ planes[clave].fotosMax }} fotos{{
                planes[clave].portada ? ', portada y alertas por correo' : ''
              }})
            </label>
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" (change)="seleccionarComprobante($event)" />
          <button class="boton-secundario" [disabled]="!planSeleccionado || !comprobante || enviando" (click)="enviarImpulso(anuncio.id)">
            {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
          </button>
          <p class="texto-suave">
            Sube el comprobante de tu depósito o transferencia. Se activa cuando el administrador confirme el pago,
            por lo general el mismo día hábil.
          </p>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
        </div>
      </div>

      <div class="estado-vacio" *ngIf="cargado && !anuncios.length">
        <h2>Todavía no tienes anuncios publicados</h2>
        <p *ngIf="verificado">
          Publica gratis tu cuarto, garzonier o departamento y permite que las personas interesadas lo encuentren cerca de la UAB y del centro de Vinto.
        </p>
        <p *ngIf="verificado === false">
          Después de verificar tu identidad, podrás publicar gratis tu cuarto, garzonier o departamento y permitir que las personas
          interesadas lo encuentren cerca de la UAB y del centro de Vinto.
        </p>
        <a routerLink="/publicar" class="boton-principal" *ngIf="verificado">Publicar mi primer aviso</a>
      </div>
    </section>
  `,
  styles: [
    `
      .mis-anuncios { max-width: 900px; margin: 0 auto; padding: 32px 20px 60px; }
      .cabecera-mis-anuncios { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .aviso-verificar-publicador, .estado-vacio {
        background: var(--superficie-alt, #F7EFE3);
        border: 1px solid var(--borde);
        border-radius: 14px;
        padding: 18px 20px;
        margin: 16px 0;
      }
      .aviso-verificar-publicador, .estado-vacio { display: flex; flex-direction: column; gap: 14px; }
      .aviso-verificar-publicador { align-items: flex-start; }
      .estado-vacio { align-items: center; }
      .aviso-verificar-publicador p, .estado-vacio p, .estado-vacio h2 { margin: 0; line-height: 1.55; }
      .aviso-verificar-publicador .boton-principal, .estado-vacio .boton-principal { display: inline-block; }
      .nota-datos { font-size: 12.5px; color: var(--texto-suave); }
      .beneficios-verificacion { align-self: stretch; padding-top: 14px; border-top: 1px dashed var(--borde); font-size: 13.5px; }
      .beneficios-verificacion ul { margin: 6px 0 0; padding-left: 18px; line-height: 1.6; }
      .estado-vacio { text-align: center; padding: 32px 20px; }
      .estado-vacio h2 { margin: 0; }
      .resumen-publicador { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
      .resumen-publicador div {
        background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 12px 14px;
        display: flex; flex-direction: column; gap: 2px;
      }
      .resumen-publicador span { font-size: 12px; color: var(--texto-suave); }
      .resumen-publicador strong { font-size: 22px; color: var(--acento-oscuro); }
      .tarjeta-publicador { margin-bottom: 16px; }
      .cuerpo-publicador { display: flex; gap: 16px; }
      .foto-publicador {
        width: 140px; height: 105px; flex-shrink: 0; border-radius: 10px; overflow: hidden;
        background: #F3ECE0; display: flex; align-items: center; justify-content: center;
        font-size: 12px; color: var(--texto-suave);
      }
      .foto-publicador img { width: 100%; height: 100%; object-fit: cover; }
      .datos-publicador { flex: 1; min-width: 0; }
      .datos-publicador p { margin: 4px 0; }
      .tipo-anuncio { text-transform: capitalize; }
      .precio-linea { color: var(--acento-oscuro); }
      .etiquetas-estado { display: flex; gap: 8px; align-items: center; margin: 6px 0; }
      .etiquetas-estado .insignia-sello { position: static; }
      .estado-anuncio { font: 700 11.5px 'Manrope', sans-serif; padding: 3px 10px; border-radius: 999px; }
      .estado-disponible { background: #E3F4E8; color: #1F6B3A; }
      .estado-ocupado { background: #EEF0F3; color: #4A5565; }
      .estado-pausado { background: #FBF1E3; color: #8A5A12; }
      .fechas-anuncio { font-size: 12.5px; }
      .aviso-fotos { font-size: 12.5px; color: #8A5A12; }
      .acciones { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: center; }
      .boton-texto-peligro { background: none; border: none; color: var(--rojo, #B42318); font-weight: 600; cursor: pointer; padding: 8px 10px; }
      .accion-impulso { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--borde); }
      .boton-impulso {
        background: linear-gradient(90deg, #F2C879, #C9622D); color: #fff; border: none;
        border-radius: 999px; padding: 8px 16px; font-weight: 700; cursor: pointer;
      }
      @media (max-width: 560px) {
        .cuerpo-publicador { flex-direction: column; }
        .foto-publicador { width: 100%; height: 160px; }
        .resumen-publicador { grid-template-columns: 1fr 1fr 1fr; }
      }
      .miniaturas-fotos {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
      }
      .miniatura {
        position: relative;
        width: 110px;
      }
      .miniatura img {
        width: 110px;
        height: 90px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
      }
      .boton-quitar-foto {
        width: 100%;
        margin-top: 4px;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class MisAnunciosComponent implements OnInit {
  anuncios: Anuncio[] = [];
  cargado = false;
  verificado: boolean | null = null;
  impulsos: Impulso[] = [];
  planes: Record<string, PlanImpulsoInfo> = {};
  planesClaves: string[] = [];

  formularioAbierto: number | null = null;
  planSeleccionado: string | null = null;
  comprobante: File | null = null;
  enviando = false;
  error = '';

  anuncioEditando: number | null = null;
  edicionTitulo = '';
  edicionPrecio: number | null = null;
  edicionDescripcion = '';
  errorEdicion = '';

  gestionFotosAbierta: number | null = null;
  fotosNuevas: File[] = [];
  subiendoFotos = false;
  errorFotos = '';

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly impulsoService: ImpulsoService,
    private readonly verificacionService: VerificacionService,
  ) {}

  ngOnInit(): void {
    this.cargarAnuncios();
    this.verificacionService.estado().subscribe({
      next: (res) => (this.verificado = res.verificado),
      error: () => (this.verificado = false),
    });
    this.impulsoService.misImpulsos().subscribe((res) => (this.impulsos = res));
    this.impulsoService.planes().subscribe((res) => {
      this.planes = res;
      this.planesClaves = Object.keys(res);
    });
  }

  private cargarAnuncios(): void {
    this.anuncioService.misAnuncios().subscribe({
      next: (res) => {
        this.anuncios = res;
        this.cargado = true;
      },
      error: () => (this.cargado = true),
    });
  }

  contar(estado: string): number {
    return this.anuncios.filter((anuncio) => anuncio.estado === estado).length;
  }

  etiquetaEstado(estado?: string): string {
    return ETIQUETAS_ESTADO[estado ?? ''] ?? estado ?? '';
  }

  sello(anuncio: Anuncio) {
    return obtenerSelloImpulso(anuncio);
  }

  impulsoActivo(anuncioId: number): Impulso | undefined {
    return this.impulsos.find((impulso) => impulso.anuncio.id === anuncioId && impulso.estado !== 'rechazado');
  }

  impulsoRechazado(anuncioId: number): Impulso | undefined {
    return [...this.impulsos]
      .reverse()
      .find((impulso) => impulso.anuncio.id === anuncioId && impulso.estado === 'rechazado');
  }

  alternarFormulario(anuncioId: number): void {
    this.formularioAbierto = this.formularioAbierto === anuncioId ? null : anuncioId;
    this.planSeleccionado = null;
    this.comprobante = null;
    this.error = '';
  }

  seleccionarComprobante(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.comprobante = input.files?.[0] || null;
  }

  enviarImpulso(anuncioId: number): void {
    if (!this.planSeleccionado || !this.comprobante) return;
    this.enviando = true;
    this.error = '';
    this.impulsoService.solicitar(anuncioId, Number(this.planSeleccionado), this.comprobante).subscribe({
      next: (impulso) => {
        this.impulsos = [...this.impulsos, impulso];
        this.enviando = false;
        this.formularioAbierto = null;
      },
      error: (err) => {
        this.enviando = false;
        this.error = err?.error?.message || 'No se pudo enviar la solicitud de impulso.';
      },
    });
  }

  alternarEdicion(anuncio: Anuncio): void {
    if (this.anuncioEditando === anuncio.id) {
      this.anuncioEditando = null;
      return;
    }
    this.anuncioEditando = anuncio.id;
    this.edicionTitulo = anuncio.titulo;
    this.edicionPrecio = anuncio.precio;
    this.edicionDescripcion = anuncio.descripcion;
    this.errorEdicion = '';
  }

  guardarEdicion(anuncio: Anuncio): void {
    this.errorEdicion = '';
    // Solo se envían los campos que cambiaron, para no revalidar lo que el publicador no tocó.
    const cambios: { titulo?: string; precio?: number; descripcion?: string } = {};
    if (this.edicionTitulo.trim() !== anuncio.titulo) cambios.titulo = this.edicionTitulo.trim();
    if (this.edicionDescripcion.trim() !== anuncio.descripcion) cambios.descripcion = this.edicionDescripcion.trim();
    if (this.edicionPrecio !== null && Number(this.edicionPrecio) !== Number(anuncio.precio)) cambios.precio = Number(this.edicionPrecio);
    if (!Object.keys(cambios).length) {
      this.anuncioEditando = null;
      return;
    }
    this.anuncioService
      .actualizar(anuncio.id, cambios)
      .subscribe({
        next: () => {
          this.anuncioEditando = null;
          this.cargarAnuncios();
        },
        error: (err) => {
          const mensaje = err?.error?.message;
          this.errorEdicion = Array.isArray(mensaje) ? mensaje.join(' ') : mensaje || 'No se pudieron guardar los cambios.';
        },
      });
  }

  alternarOcupado(anuncio: Anuncio): void {
    const nuevoEstado = anuncio.estado === 'ocupado' ? 'disponible' : 'ocupado';
    this.anuncioService.actualizar(anuncio.id, { estado: nuevoEstado } as any).subscribe(() => this.cargarAnuncios());
  }

  eliminar(anuncio: Anuncio): void {
    if (!window.confirm(`¿Eliminar el anuncio "${anuncio.titulo}"? Esta acción no se puede deshacer.`)) return;
    this.anuncioService.eliminar(anuncio.id).subscribe(() => this.cargarAnuncios());
  }

  alternarFotos(anuncioId: number): void {
    this.gestionFotosAbierta = this.gestionFotosAbierta === anuncioId ? null : anuncioId;
    this.fotosNuevas = [];
    this.errorFotos = '';
  }

  seleccionarFotosNuevas(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.fotosNuevas = input.files ? Array.from(input.files) : [];
  }

  subirFotosNuevas(anuncio: Anuncio): void {
    if (!this.fotosNuevas.length) return;
    this.subiendoFotos = true;
    this.errorFotos = '';
    this.anuncioService.subirFotos(anuncio.id, this.fotosNuevas).subscribe({
      next: () => {
        this.subiendoFotos = false;
        this.fotosNuevas = [];
        this.cargarAnuncios();
      },
      error: (err) => {
        this.subiendoFotos = false;
        this.errorFotos = err?.error?.message || 'No se pudieron subir las fotos.';
      },
    });
  }

  eliminarFoto(anuncio: Anuncio, fotoId: number): void {
    this.anuncioService.eliminarFoto(anuncio.id, fotoId).subscribe(() => this.cargarAnuncios());
  }
}
