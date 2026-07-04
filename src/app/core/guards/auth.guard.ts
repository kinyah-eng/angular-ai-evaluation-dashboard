import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '../auth/auth.service';

function checkAuthentication(
  state: RouterStateSnapshot,
): boolean | ReturnType<Router['createUrlTree']> {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        redirect: state.url,
      },
    },
  );
}

export const authGuard:
  CanActivateFn = (_route, state) =>
    checkAuthentication(state);

export const authChildGuard:
  CanActivateChildFn = (_route, state) =>
    checkAuthentication(state);
