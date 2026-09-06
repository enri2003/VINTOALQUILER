import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export function publicadorGuard(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esPublicador()) {
    return true;
  }
  router.navigate(['/']);
  return false;
}
