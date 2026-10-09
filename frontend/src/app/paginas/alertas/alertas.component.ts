import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { SelectorCampoComponent } from '../../componentes/selector-campo.component';
import { OpcionSelector } from '../../componentes/selector-buscador.component';

interface Zona {
  id: number;
  nombre: string;
}

interface Alerta {
  id: number;
  tipo: string | null;
  precioMax: number | null;
  activa: boolean;
  zona?: Zona | null;
}

const NOMBRES_TIPO: Record<string, string> = {
  cuarto: 'Cuarto',
  garzonier: 'Garzonier',
  departamento: 'Departamento',
};

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, SelectorCampoComponent],
  template: `
    <section class="alertas">
      <h1>Alertas de búsqueda</h1>
      <p class="texto-suave">
        Guarda los criterios que buscas. Te avisaremos por correo cuando se publique un anuncio
        destacado que coincida con tu alerta.
      </p>

      <div class="panel-alerta">
        <h2>Crear nueva alerta</h2>
        <form (ngSubmit)="crear()" #formulario="ngForm">
          <label>
            <span class="etiqueta">Tipo de inmueble</span>
            <app-selector-campo name="tipo" [(ngModel)]="tipo" [opciones]="opcionesTipo"></app-selector-campo>
          </label>
          <label>
            <span class="etiqueta">Zona</span>
            <app-selector-campo name="zonaId" [(ngModel)]="zonaId" [opciones]="opcionesZona"></app-selector-campo>
          </label>
          <label>
            <span class="etiqueta">Precio máximo mensual (Bs.)</span>
            <input
              type="number"
              name="precioMax"
              min="1"
              step="50"
              placeholder="Ejemplo: 1200"
              [(ngModel)]="precioMax"
              [class.invalido]="precioMax !== null && precioMax <= 0"
            />
            <small class="ayuda-campo" *ngIf="precioMax !== null && precioMax <= 0">Ingresa un precio mayor a cero.</small>
          </label>
          <button type="submit" class="boton-principal" [disabled]="precioMax !== null && precioMax <= 0">Crear alerta</button>
        </form>
        <p class="mensaje-error" *ngIf="error">{{ error }}</p>
      </div>

      <h2 class="titulo-guardadas">Mis alertas guardadas</h2>
      <p class="texto-suave" *ngIf="!alertas.length">Aún no tienes alertas guardadas.</p>

      <div class="lista-alertas">
        <div *ngFor="let alerta of alertas" class="tarjeta-alerta">
          <div class="cabecera-alerta">
            <strong>{{ describir(alerta) }}</strong>
            <span class="estado" [class.activa]="alerta.activa">
              <i class="punto" [class.punto-activo]="alerta.activa"></i>
              {{ alerta.activa ? 'Activa' : 'Desactivada' }}
            </span>
          </div>
          <button class="boton-secundario" (click)="alternarActiva(alerta)">
            {{ alerta.activa ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .alertas { max-width: 720px; margin: 0 auto; padding: 32px 20px 60px; }
      .panel-alerta {
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 16px;
        padding: 20px;
        margin: 16px 0 28px;
      }
      .panel-alerta h2 { font-size: 17px; margin: 0 0 12px; }
      .panel-alerta form { display: flex; flex-direction: column; gap: 12px; }
      .invalido { border-color: var(--rojo, #A34848) !important; }
      .ayuda-campo { color: var(--rojo, #A34848); font-size: 12px; }
      .titulo-guardadas { font-size: 17px; margin: 0 0 12px; }
      .lista-alertas { display: flex; flex-direction: column; gap: 10px; }
      .tarjeta-alerta {
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 14px;
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cabecera-alerta { display: flex; flex-direction: column; gap: 4px; }
      .estado {
        font-size: 12px;
        color: var(--texto-suave, #6E6255);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .estado.activa { color: #3E8E5B; font-weight: 700; }
      .punto {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #B9B1A3;
        display: inline-block;
      }
      .punto-activo { background: #3E8E5B; box-shadow: 0 0 6px rgba(62, 142, 91, 0.6); }
    `,
  ],
})
export class AlertasComponent implements OnInit {
  private readonly apiUrl = '/api';
  alertas: Alerta[] = [];
  zonas: Zona[] = [];
  readonly opcionesTipo: OpcionSelector<string>[] = [
    { valor: '', texto: 'Todos los tipos' },
    { valor: 'cuarto', texto: 'Cuarto' },
    { valor: 'garzonier', texto: 'Garzonier' },
    { valor: 'departamento', texto: 'Departamento' },
  ];
  opcionesZona: OpcionSelector<number | null>[] = [{ valor: null, texto: 'Todas las zonas' }];
  tipo = '';
  zonaId: number | null = null;
  precioMax: number | null = null;
  error = '';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => {
      this.zonas = res;
      this.opcionesZona = [{ valor: null, texto: 'Todas las zonas' }, ...res.map((zona) => ({ valor: zona.id, texto: zona.nombre }))];
    });
  }

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  private cargar(): void {
    this.http
      .get<Alerta[]>(`${this.apiUrl}/alertas`, { headers: this.cabeceras() })
      .subscribe((res) => (this.alertas = res));
  }

  describir(alerta: Alerta): string {
    const tipo = alerta.tipo ? NOMBRES_TIPO[alerta.tipo] ?? alerta.tipo : 'Cualquier tipo';
    const zona = alerta.zona ? `en ${alerta.zona.nombre}` : 'en cualquier zona';
    const precio = alerta.precioMax !== null && alerta.precioMax !== undefined
      ? ` hasta Bs. ${Number(alerta.precioMax).toLocaleString('es-BO', { maximumFractionDigits: 0 })}/mes`
      : '';
    return `${tipo} ${zona}${precio}`;
  }

  crear(): void {
    this.error = '';
    if (this.precioMax !== null && this.precioMax <= 0) {
      this.error = 'Ingresa un precio máximo mayor a cero.';
      return;
    }
    this.http
      .post(
        `${this.apiUrl}/alertas`,
        {
          tipo: this.tipo || null,
          zonaId: this.zonaId,
          precioMax: this.precioMax ?? null,
        },
        { headers: this.cabeceras() },
      )
      .subscribe({
        next: () => {
          this.tipo = '';
          this.zonaId = null;
          this.precioMax = null;
          this.cargar();
        },
        error: (err) => (this.error = err?.error?.message || 'No se pudo crear la alerta.'),
      });
  }

  alternarActiva(alerta: Alerta): void {
    this.http
      .patch(`${this.apiUrl}/alertas/${alerta.id}`, { activa: !alerta.activa }, { headers: this.cabeceras() })
      .subscribe(() => this.cargar());
  }
}
