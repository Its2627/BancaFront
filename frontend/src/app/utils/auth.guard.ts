import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authSrv = inject(AuthService);
  const router = inject(Router);

  return authSrv.ensureLoaded().pipe(
    map(user =>
      user
        ? true
        : router.createUrlTree(['/landing/login'], { queryParams: { dest: state.url } })
    )
  );
};
