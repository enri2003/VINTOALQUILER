import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export function interesadoGuard(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esInteresado()) {
    return true;
  }
  router.navigate(['/']);
  return false;
}
