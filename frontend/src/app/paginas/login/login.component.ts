import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="login">
      <h1>Iniciar sesion</h1>
      <form (ngSubmit)="enviar()">
        <input type="email" name="correo" placeholder="Correo" [(ngModel)]="correo" required />
        <input type="password" name="clave" placeholder="Contrasena" [(ngModel)]="clave" required />
        <button type="submit">Ingresar</button>
      </form>
      <p *ngIf="error">{{ error }}</p>
    </section>
  `,
})
export class LoginComponent {
  correo = '';
  clave = '';
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  enviar(): void {
    this.authService.iniciarSesion(this.correo, this.clave).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => (this.error = 'Correo o contrasena incorrectos'),
    });
  }
}
