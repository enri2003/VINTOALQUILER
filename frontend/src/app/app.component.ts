import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './servicios/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="cabecera">
      <a routerLink="/" class="marca">Alquileres Vinto</a>
      <nav class="nav-escritorio">
        <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/explorar" routerLinkActive="activo">Explorar</a>
        <a routerLink="/mapa" routerLinkActive="activo">Mapa</a>
        <a routerLink="/observatorio" routerLinkActive="activo">Datos</a>
        <ng-container *ngIf="authService.estaAutenticado(); else invitado">
          <a routerLink="/favoritos" routerLinkActive="activo">Favoritos</a>
          <a routerLink="/alertas" routerLinkActive="activo">Alertas</a>
          <a routerLink="/publicar" routerLinkActive="activo">Publicar</a>
          <a routerLink="/mis-anuncios" routerLinkActive="activo">Mis anuncios</a>
          <a routerLink="/verificacion" class="insignia-verificacion">Identidad sin verificar</a>
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

    <nav class="nav-movil">
      <a routerLink="/explorar" routerLinkActive="activo">
        <span class="icono">◱</span>
        Explorar
      </a>
      <a routerLink="/mapa" routerLinkActive="activo">
        <span class="icono">◎</span>
        Mapa
      </a>
      <a routerLink="/favoritos" routerLinkActive="activo">
        <span class="icono">♡</span>
        Favoritos
      </a>
      <a routerLink="/observatorio" routerLinkActive="activo">
        <span class="icono">▤</span>
        Datos
      </a>
      <a [routerLink]="authService.estaAutenticado() ? '/mis-anuncios' : '/login'" routerLinkActive="activo">
        <span class="icono">◍</span>
        Perfil
      </a>
    </nav>
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
