import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

interface Zona {
  id: number;
  nombre: string;
}

interface Alerta {
  id: number;
  tipo: string;
  precioMax: number;
  activa: boolean;
  zona?: Zona;
}

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="alertas">
      <h1>Mis alertas</h1>
      <form (ngSubmit)="crear()">
        <select name="tipo" [(ngModel)]="tipo">
          <option value="cuarto">Cuarto</option>
          <option value="garzonier">Garzonier</option>
          <option value="departamento">Departamento</option>
        </select>
        <select name="zonaId" [(ngModel)]="zonaId">
          <option [ngValue]="null">Todas las zonas</option>
          <option *ngFor="let zona of zonas" [ngValue]="zona.id">{{ zona.nombre }}</option>
        </select>
        <input type="number" name="precioMax" placeholder="Precio maximo" [(ngModel)]="precioMax" />
        <button type="submit">Crear alerta</button>
      </form>
      <p class="mensaje-error" *ngIf="error">{{ error }}</p>
      <div *ngFor="let alerta of alertas" class="tarjeta">
        <p>
          {{ alerta.tipo }} hasta Bs. {{ alerta.precioMax }}
          <ng-container *ngIf="alerta.zona"> en {{ alerta.zona.nombre }}</ng-container>
        </p>
        <p class="texto-suave">Estado: {{ alerta.activa ? 'Activa' : 'Desactivada' }}</p>
        <button class="boton-secundario" (click)="alternarActiva(alerta)">
          {{ alerta.activa ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
      <p class="texto-suave" *ngIf="!alertas.length">Aun no tienes alertas configuradas.</p>
    </section>
  `,
})
export class AlertasComponent implements OnInit {
  private readonly apiUrl = '/api';
  alertas: Alerta[] = [];
  zonas: Zona[] = [];
  tipo = 'cuarto';
  zonaId: number | null = null;
  precioMax: number | null = null;
  error = '';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => (this.zonas = res));
  }

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.obtenerToken()}` });
  }

  private cargar(): void {
    this.http
      .get<Alerta[]>(`${this.apiUrl}/alertas`, { headers: this.cabeceras() })
      .subscribe((res) => (this.alertas = res));
  }

  crear(): void {
    this.error = '';
    this.http
      .post(
        `${this.apiUrl}/alertas`,
        { tipo: this.tipo, zonaId: this.zonaId, precioMax: this.precioMax },
        { headers: this.cabeceras() },
      )
      .subscribe({
        next: () => this.cargar(),
        error: (err) => (this.error = err?.error?.message || 'No se pudo crear la alerta.'),
      });
  }

  alternarActiva(alerta: Alerta): void {
    this.http
      .patch(`${this.apiUrl}/alertas/${alerta.id}`, { activa: !alerta.activa }, { headers: this.cabeceras() })
      .subscribe(() => this.cargar());
  }
}
