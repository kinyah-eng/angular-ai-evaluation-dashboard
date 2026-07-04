import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { UserRole } from '../auth/auth.model';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (
  route,
  state,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles =
    route.data['roles'] as
      | readonly UserRole[]
      | undefined;

  if (
    !requiredRoles?.length ||
    auth.hasAnyRole(requiredRoles)
  ) {
    return true;
  }

  return router.createUrlTree(
    ['/unauthorized'],
    {
      queryParams: {
        from: state.url,
      },
    },
  );
};
