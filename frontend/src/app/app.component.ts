import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './servicios/auth.service';

const RUTAS_SIN_NAV = ['/', '/login', '/registro'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="cabecera" *ngIf="!ocultarNav">
      <a routerLink="/" class="marca">Alquileres Vinto</a>

      <nav class="nav-principal">
        <a routerLink="/explorar" routerLinkActive="activo">Explorar</a>
        <a routerLink="/mapa" routerLinkActive="activo">Mapa</a>
        <a routerLink="/observatorio" routerLinkActive="activo">Datos</a>
        <ng-container *ngIf="authService.estaAutenticado()">
          <a routerLink="/favoritos" routerLinkActive="activo">Favoritos</a>
          <a routerLink="/alertas" routerLinkActive="activo">Alertas</a>
          <a routerLink="/mis-anuncios" routerLinkActive="activo">Mis anuncios</a>
        </ng-container>
      </nav>

      <div class="acciones-cabecera">
        <ng-container *ngIf="authService.estaAutenticado(); else invitado">
          <a routerLink="/publicar" routerLinkActive="activo" class="boton-secundario boton-cabecera">Publicar</a>
          <a routerLink="/verificacion" class="insignia-verificacion">Identidad sin verificar</a>
          <button class="boton-salir" (click)="salir()">Salir</button>
        </ng-container>
        <ng-template #invitado>
          <a routerLink="/login">Iniciar sesion</a>
          <a routerLink="/registro" class="cta-registro">Crear cuenta</a>
        </ng-template>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>

    <nav class="nav-movil" *ngIf="!ocultarNav">
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
  ocultarNav = false;

  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.ocultarNav = RUTAS_SIN_NAV.includes(this.router.url.split('?')[0]);
    });
  }

  salir(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}
