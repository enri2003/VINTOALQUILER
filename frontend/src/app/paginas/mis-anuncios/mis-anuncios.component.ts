import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Anuncio, AnuncioService } from '../../servicios/anuncio.service';
import { Impulso, ImpulsoService, PlanImpulsoInfo } from '../../servicios/impulso.service';

@Component({
  selector: 'app-mis-anuncios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mis-anuncios">
      <h1>Mis anuncios</h1>
      <div *ngFor="let anuncio of anuncios" class="tarjeta">
        <h2>{{ anuncio.titulo }}</h2>
        <p class="precio">Bs. {{ anuncio.precio }}</p>
        <p class="texto-suave">Estado: {{ anuncio.estado }}</p>
        <p class="texto-suave" *ngIf="impulsoActivo(anuncio.id) as impulso">
          Impulso plan {{ impulso.plan }} dias ·
          {{ impulso.estado === 'pendiente' ? 'Pendiente de confirmacion (se activa el mismo dia habil tras validar el pago)' : impulso.estado }}
        </p>
        <p class="mensaje-error" *ngIf="impulsoRechazado(anuncio.id) as rechazado">
          Impulso rechazado: {{ rechazado.motivoRechazo }}. Puedes intentar de nuevo con otro comprobante.
        </p>

        <div class="acciones">
          <button class="boton-secundario" (click)="alternarEdicion(anuncio)">
            {{ anuncioEditando === anuncio.id ? 'Cancelar edicion' : 'Editar' }}
          </button>
          <button class="boton-secundario" (click)="alternarOcupado(anuncio)">
            {{ anuncio.estado === 'ocupado' ? 'Marcar disponible' : 'Marcar ocupado' }}
          </button>
          <button class="boton-secundario" (click)="eliminar(anuncio)">Eliminar</button>
          <button
            class="boton-secundario"
            (click)="alternarFormulario(anuncio.id)"
            *ngIf="!impulsoActivo(anuncio.id)"
          >
            {{ formularioAbierto === anuncio.id ? 'Cancelar' : 'Impulsar anuncio' }}
          </button>
        </div>

        <div class="formulario-edicion" *ngIf="anuncioEditando === anuncio.id">
          <input type="text" [(ngModel)]="edicionTitulo" placeholder="Titulo" />
          <input type="number" [(ngModel)]="edicionPrecio" placeholder="Precio en bolivianos" />
          <textarea [(ngModel)]="edicionDescripcion" placeholder="Descripcion"></textarea>
          <button class="boton-secundario" (click)="guardarEdicion(anuncio)">Guardar cambios</button>
          <p class="mensaje-error" *ngIf="errorEdicion">{{ errorEdicion }}</p>
        </div>

        <div class="formulario-impulso" *ngIf="formularioAbierto === anuncio.id">
          <div *ngFor="let clave of planesClaves" class="opcion-plan">
            <label>
              <input type="radio" name="plan-{{ anuncio.id }}" [value]="clave" [(ngModel)]="planSeleccionado" />
              {{ clave }} dias - Bs. {{ planes[clave].precio }} ({{ planes[clave].fotosMax }} fotos{{
                planes[clave].portada ? ', portada y alertas por correo' : ''
              }})
            </label>
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" (change)="seleccionarComprobante($event)" />
          <button class="boton-secundario" [disabled]="!planSeleccionado || !comprobante || enviando" (click)="enviarImpulso(anuncio.id)">
            {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
          </button>
          <p class="texto-suave">
            Sube el comprobante de tu deposito o transferencia. Se activa cuando el administrador confirme el pago,
            por lo general el mismo dia habil.
          </p>
          <p class="mensaje-error" *ngIf="error">{{ error }}</p>
        </div>
      </div>
      <p class="texto-suave" *ngIf="!anuncios.length">Aun no tienes anuncios publicados.</p>
    </section>
  `,
})
export class MisAnunciosComponent implements OnInit {
  anuncios: Anuncio[] = [];
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

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly impulsoService: ImpulsoService,
  ) {}

  ngOnInit(): void {
    this.cargarAnuncios();
    this.impulsoService.misImpulsos().subscribe((res) => (this.impulsos = res));
    this.impulsoService.planes().subscribe((res) => {
      this.planes = res;
      this.planesClaves = Object.keys(res);
    });
  }

  private cargarAnuncios(): void {
    this.anuncioService.misAnuncios().subscribe((res) => (this.anuncios = res));
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
    this.anuncioService
      .actualizar(anuncio.id, {
        titulo: this.edicionTitulo,
        precio: this.edicionPrecio ?? undefined,
        descripcion: this.edicionDescripcion,
      })
      .subscribe({
        next: () => {
          this.anuncioEditando = null;
          this.cargarAnuncios();
        },
        error: (err) => {
          this.errorEdicion = err?.error?.message || 'No se pudo guardar los cambios.';
        },
      });
  }

  alternarOcupado(anuncio: Anuncio): void {
    const nuevoEstado = anuncio.estado === 'ocupado' ? 'disponible' : 'ocupado';
    this.anuncioService.actualizar(anuncio.id, { estado: nuevoEstado } as any).subscribe(() => this.cargarAnuncios());
  }

  eliminar(anuncio: Anuncio): void {
    if (!window.confirm(`¿Eliminar el anuncio "${anuncio.titulo}"? Esta accion no se puede deshacer.`)) return;
    this.anuncioService.eliminar(anuncio.id).subscribe(() => this.cargarAnuncios());
  }
}
