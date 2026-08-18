import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="registro">
      <h1>Crear cuenta</h1>
      <form (ngSubmit)="enviar()">
        <input type="text" name="nombre" placeholder="Nombre" [(ngModel)]="nombre" required />
        <input type="email" name="correo" placeholder="Correo" [(ngModel)]="correo" required />
        <input type="password" name="clave" placeholder="Contrasena" [(ngModel)]="clave" required />
        <input type="tel" name="celular" placeholder="Celular" [(ngModel)]="celular" required />
        <select name="rol" [(ngModel)]="rol" required>
          <option value="interesado">Busco alquiler</option>
          <option value="publicador">Publico alquileres</option>
        </select>
        <button type="submit">Registrarme</button>
      </form>
      <p *ngIf="error">{{ error }}</p>
    </section>
  `,
})
export class RegistroComponent {
  nombre = '';
  correo = '';
  clave = '';
  celular = '';
  rol: 'interesado' | 'publicador' = 'interesado';
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  enviar(): void {
    this.authService
      .registrar({
        nombre: this.nombre,
        correo: this.correo,
        clave: this.clave,
        celular: this.celular,
        rol: this.rol,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: () => (this.error = 'No se pudo completar el registro'),
      });
  }
}
