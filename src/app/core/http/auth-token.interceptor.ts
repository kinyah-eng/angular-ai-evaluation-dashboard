import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { AppConfigService } from '../config/app-config.service';

export const authTokenInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const auth = inject(AuthService);
    const config = inject(AppConfigService);

    const session = auth.session();

    const isApiRequest =
      request.url.startsWith(
        config.apiBaseUrl,
      );

    if (!session || !isApiRequest) {
      return next(request);
    }

    return next(
      request.clone({
        setHeaders: {
          Authorization:
            `Bearer ${session.token}`,
        },
      }),
    );
  };
