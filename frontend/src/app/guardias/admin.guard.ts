import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export function adminGuard(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }
  router.navigate(['/']);
  return false;
}
