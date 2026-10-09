import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './servicios/auth.service';
import { VerificacionService } from './servicios/verificacion.service';

const RUTAS_SIN_NAV = ['/login', '/registro'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="cabecera" *ngIf="!ocultarNav">
      <a routerLink="/" class="marca">
        <img src="/assets/icono-logo.png" alt="" class="icono-logo" />
        <span class="texto-marca">Vinto<span class="acento-marca">Alquiler</span></span>
      </a>

      <nav class="nav-principal">
        <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/mapa" routerLinkActive="activo">Mapa</a>
        <a routerLink="/observatorio" routerLinkActive="activo">Datos</a>
        <ng-container *ngIf="authService.esInteresado()">
          <a routerLink="/favoritos" routerLinkActive="activo">Favoritos</a>
          <a routerLink="/alertas" routerLinkActive="activo">Alertas</a>
          <a routerLink="/recomendados" routerLinkActive="activo">Recomendados</a>
        </ng-container>
        <a *ngIf="authService.esPublicador()" routerLink="/mis-anuncios" routerLinkActive="activo">Mis anuncios</a>
        <a *ngIf="authService.esPublicador()" routerLink="/publicar" routerLinkActive="activo">Publicar aviso</a>
        <a *ngIf="authService.esAdmin()" routerLink="/admin" routerLinkActive="activo">Admin</a>
      </nav>

      <div class="acciones-cabecera">
        <ng-container *ngIf="authService.estaAutenticado(); else invitado">
          <a routerLink="/verificacion" class="insignia-verificacion" *ngIf="verificado === false">Identidad pendiente</a>
          <button class="boton-salir" (click)="salir()">Salir</button>
        </ng-container>
        <ng-template #invitado>
          <a routerLink="/login" class="cta-registro">Iniciar sesión</a>
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
      <a *ngIf="authService.esInteresado()" routerLink="/favoritos" routerLinkActive="activo">
        <span class="icono">♡</span>
        Favoritos
      </a>
      <a routerLink="/observatorio" routerLinkActive="activo">
        <span class="icono">▤</span>
        Datos
      </a>
      <a [routerLink]="rutaPerfil()" routerLinkActive="activo">
        <span class="icono">◍</span>
        Perfil
      </a>
    </nav>
  `,
})
export class AppComponent {
  ocultarNav = false;
  verificado: boolean | null = null;

  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
    private readonly verificacionService: VerificacionService,
  ) {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.ocultarNav = RUTAS_SIN_NAV.includes(this.router.url.split('?')[0]);
      this.actualizarVerificacion();
    });
    this.verificacionService.aprobada$.subscribe(() => (this.verificado = true));
  }

  private actualizarVerificacion(): void {
    if (!this.authService.estaAutenticado()) {
      this.verificado = null;
      return;
    }
    if (this.verificado) return;
    this.verificacionService.estado().subscribe({
      next: (res) => (this.verificado = res.verificado),
      error: () => (this.verificado = null),
    });
  }

  salir(): void {
    this.verificado = null;
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }

  rutaPerfil(): string {
    if (!this.authService.estaAutenticado()) return '/login';
    if (this.authService.esPublicador()) return '/mis-anuncios';
    if (this.authService.esAdmin()) return '/admin';
    return '/verificacion';
  }
}
