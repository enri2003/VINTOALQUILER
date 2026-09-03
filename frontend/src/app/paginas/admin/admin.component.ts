import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';

interface Reporte {
  id: number;
  motivo: string;
  detalle?: string;
  creadoEn: string;
  anuncio: { id: number; titulo: string; estado: string; publicador: { nombre: string } };
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  celular: string;
  rol: string;
  verificado: boolean;
  activo: boolean;
  creadoEn: string;
}

interface ImpulsoPendiente {
  id: number;
  plan: number;
  precio: number;
  comprobanteUrl: string;
  estado: string;
  anuncio: { id: number; titulo: string; publicador: { nombre: string } };
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Panel de administracion</h1>

      <div class="encabezado-seccion">
        <div>
          <h2>Anuncios reportados</h2>
          <p class="subtitulo">{{ reportes.length }} reporte(s)</p>
        </div>
      </div>
      <div *ngFor="let reporte of reportes" class="tarjeta">
        <div class="fila-tarjeta">
          <p class="precio">{{ reporte.anuncio.titulo }}</p>
          <span class="chip">{{ reporte.anuncio.estado }}</span>
        </div>
        <p class="texto-suave">Motivo: {{ reporte.motivo }}</p>
        <p class="texto-suave" *ngIf="reporte.detalle">Detalle: {{ reporte.detalle }}</p>
        <p class="texto-suave">Publicador: {{ reporte.anuncio.publicador.nombre }}</p>
        <div class="acciones">
          <button class="boton-secundario" (click)="moderar(reporte.anuncio.id, 'pausado')">
            Pausar anuncio
          </button>
          <button class="boton-secundario" (click)="moderar(reporte.anuncio.id, 'disponible')">
            Mantener disponible
          </button>
        </div>
      </div>
      <p class="texto-suave" *ngIf="!reportes.length">No hay anuncios reportados.</p>

      <div class="encabezado-seccion">
        <div>
          <h2>Impulsos pendientes de pago</h2>
          <p class="subtitulo">{{ impulsosPendientes.length }} solicitud(es)</p>
        </div>
      </div>
      <div *ngFor="let impulso of impulsosPendientes" class="tarjeta">
        <div class="fila-tarjeta">
          <p class="precio">{{ impulso.anuncio.titulo }}</p>
          <span class="chip">Plan {{ impulso.plan }} dias - Bs. {{ impulso.precio }}</span>
        </div>
        <p class="texto-suave">Publicador: {{ impulso.anuncio.publicador.nombre }}</p>
        <a [href]="impulso.comprobanteUrl" target="_blank" rel="noopener">Ver comprobante</a>
        <div class="acciones">
          <button class="boton-secundario" (click)="activarImpulso(impulso.id)">Activar impulso</button>
          <button class="boton-secundario" (click)="rechazarImpulso(impulso.id)">Rechazar</button>
        </div>
      </div>
      <p class="texto-suave" *ngIf="!impulsosPendientes.length">No hay solicitudes de impulso pendientes.</p>

      <div class="encabezado-seccion">
        <div>
          <h2>Usuarios</h2>
          <p class="subtitulo">{{ usuarios.length }} usuario(s)</p>
        </div>
      </div>
      <div *ngFor="let usuario of usuarios" class="tarjeta">
        <div class="fila-tarjeta">
          <p class="precio">{{ usuario.nombre }}</p>
          <span class="chip">{{ usuario.rol }}</span>
        </div>
        <p class="texto-suave">{{ usuario.correo }} - {{ usuario.celular }}</p>
        <p class="texto-suave">
          Verificado: {{ usuario.verificado ? 'Si' : 'No' }} · Estado: {{ usuario.activo ? 'Activo' : 'Suspendido' }}
        </p>
        <button
          class="boton-secundario"
          (click)="cambiarActivo(usuario)"
          *ngIf="usuario.rol !== 'admin'"
        >
          {{ usuario.activo ? 'Suspender cuenta' : 'Reactivar cuenta' }}
        </button>
      </div>
    </section>
  `,
})
export class AdminComponent implements OnInit {
  private readonly apiUrl = '';
  reportes: Reporte[] = [];
  usuarios: Usuario[] = [];
  impulsosPendientes: ImpulsoPendiente[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
    this.cargarUsuarios();
    this.cargarImpulsosPendientes();
  }

  private cargarImpulsosPendientes(): void {
    this.http
      .get<ImpulsoPendiente[]>(`${this.apiUrl}/impulsos/pendientes`, { headers: this.cabeceras() })
      .subscribe((res) => (this.impulsosPendientes = res));
  }

  activarImpulso(id: number): void {
    this.http
      .patch(`${this.apiUrl}/impulsos/${id}/activar`, {}, { headers: this.cabeceras() })
      .subscribe(() => this.cargarImpulsosPendientes());
  }

  rechazarImpulso(id: number): void {
    const motivo = window.prompt('Motivo del rechazo (ej: comprobante ilegible):', '') || undefined;
    this.http
      .patch(`${this.apiUrl}/impulsos/${id}/rechazar`, { motivo }, { headers: this.cabeceras() })
      .subscribe(() => this.cargarImpulsosPendientes());
  }

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  private cargarReportes(): void {
    this.http
      .get<Reporte[]>(`${this.apiUrl}/admin/reportes`, { headers: this.cabeceras() })
      .subscribe((res) => (this.reportes = res));
  }

  private cargarUsuarios(): void {
    this.http
      .get<{ datos: Usuario[] }>(`${this.apiUrl}/admin/usuarios`, { headers: this.cabeceras() })
      .subscribe((res) => (this.usuarios = res.datos));
  }

  moderar(anuncioId: number, estado: string): void {
    this.http
      .patch(`${this.apiUrl}/admin/anuncios/${anuncioId}/estado`, { estado }, { headers: this.cabeceras() })
      .subscribe(() => this.cargarReportes());
  }

  cambiarActivo(usuario: Usuario): void {
    this.http
      .patch(
        `${this.apiUrl}/admin/usuarios/${usuario.id}/activo`,
        { activo: !usuario.activo },
        { headers: this.cabeceras() },
      )
      .subscribe(() => this.cargarUsuarios());
  }
}
