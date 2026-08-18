import { Routes } from '@angular/router';
import { BienvenidaComponent } from './paginas/bienvenida/bienvenida.component';
import { LoginComponent } from './paginas/login/login.component';
import { RegistroComponent } from './paginas/registro/registro.component';
import { ExplorarComponent } from './paginas/explorar/explorar.component';
import { DetalleComponent } from './paginas/detalle/detalle.component';
import { PublicarComponent } from './paginas/publicar/publicar.component';
import { MisAnunciosComponent } from './paginas/mis-anuncios/mis-anuncios.component';
import { VerificacionComponent } from './paginas/verificacion/verificacion.component';
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
];
