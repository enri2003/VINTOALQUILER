import { Routes } from '@angular/router';
import { BienvenidaComponent } from './paginas/bienvenida/bienvenida.component';
import { LoginComponent } from './paginas/login/login.component';
import { RegistroComponent } from './paginas/registro/registro.component';
import { ExplorarComponent } from './paginas/explorar/explorar.component';
import { DetalleComponent } from './paginas/detalle/detalle.component';
import { PublicarComponent } from './paginas/publicar/publicar.component';
import { MisAnunciosComponent } from './paginas/mis-anuncios/mis-anuncios.component';
import { VerificacionComponent } from './paginas/verificacion/verificacion.component';
import { ReportarComponent } from './paginas/reportar/reportar.component';
import { ContactoComponent } from './paginas/contacto/contacto.component';
import { FavoritosComponent } from './paginas/favoritos/favoritos.component';
import { ComparacionComponent } from './paginas/comparacion/comparacion.component';
import { AlertasComponent } from './paginas/alertas/alertas.component';
import { MapaComponent } from './paginas/mapa/mapa.component';
import { PlanesComponent } from './paginas/planes/planes.component';
import { EstadisticasComponent } from './paginas/estadisticas/estadisticas.component';
import { authGuard } from './guardias/auth.guard';

export const routes: Routes = [
  { path: '', component: BienvenidaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'explorar', component: ExplorarComponent },
  { path: 'anuncio/:id', component: DetalleComponent },
  { path: 'publicar', component: PublicarComponent, canActivate: [authGuard] },
  { path: 'mis-anuncios', component: MisAnunciosComponent, canActivate: [authGuard] },
  { path: 'verificacion', component: VerificacionComponent, canActivate: [authGuard] },
  { path: 'anuncio/:id/reportar', component: ReportarComponent },
  { path: 'anuncio/:id/contacto', component: ContactoComponent, canActivate: [authGuard] },
  { path: 'favoritos', component: FavoritosComponent, canActivate: [authGuard] },
  { path: 'comparacion', component: ComparacionComponent, canActivate: [authGuard] },
  { path: 'alertas', component: AlertasComponent, canActivate: [authGuard] },
  { path: 'mapa', component: MapaComponent },
  { path: 'planes', component: PlanesComponent, canActivate: [authGuard] },
  { path: 'estadisticas', component: EstadisticasComponent, canActivate: [authGuard] },
];
