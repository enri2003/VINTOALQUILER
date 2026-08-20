import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './servicios/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <header class="cabecera">
      <a routerLink="/" class="marca">Alquileres Vinto</a>
      <nav>
        <a routerLink="/explorar">Explorar</a>
        <a routerLink="/mapa">Mapa</a>
        <a routerLink="/observatorio">Observatorio</a>
        <ng-container *ngIf="authService.estaAutenticado(); else invitado">
          <a routerLink="/favoritos">Favoritos</a>
          <a routerLink="/publicar">Publicar</a>
          <a routerLink="/mis-anuncios">Mis anuncios</a>
          <button class="boton-salir" (click)="salir()">Salir</button>
        </ng-container>
        <ng-template #invitado>
          <a routerLink="/login">Iniciar sesion</a>
          <a routerLink="/registro" class="cta-registro">Crear cuenta</a>
        </ng-template>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  salir(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}
