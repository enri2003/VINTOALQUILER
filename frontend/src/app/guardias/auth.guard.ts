import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }
  // Recuerda la página pedida para volver a ella después de iniciar sesión.
  return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
};
