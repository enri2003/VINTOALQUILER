import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

interface Alerta {
  id: number;
  tipo: string;
  precioMax: number;
  activa: boolean;
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
        <input type="number" name="precioMax" placeholder="Precio maximo" [(ngModel)]="precioMax" />
        <button type="submit">Crear alerta</button>
      </form>
      <div *ngFor="let alerta of alertas" class="tarjeta">
        <p>{{ alerta.tipo }} hasta Bs. {{ alerta.precioMax }}</p>
      </div>
    </section>
  `,
})
export class AlertasComponent implements OnInit {
  private readonly apiUrl = '';
  alertas: Alerta[] = [];
  tipo = 'cuarto';
  precioMax: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargar();
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
    this.http
      .post(`${this.apiUrl}/alertas`, { tipo: this.tipo, precioMax: this.precioMax }, { headers: this.cabeceras() })
      .subscribe(() => this.cargar());
  }
}
