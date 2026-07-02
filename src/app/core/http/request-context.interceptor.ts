import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { AppConfigService } from '../config/app-config.service';

export const requestContextInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const config = inject(AppConfigService);

    if (
      !request.url.startsWith(
        config.apiBaseUrl,
      )
    ) {
      return next(request);
    }

    const requestIdentifier =
      globalThis.crypto?.randomUUID?.() ??
      `request-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;

    return next(
      request.clone({
        setHeaders: {
          'X-Request-ID':
            requestIdentifier,
          'X-Client-Version':
            config.applicationVersion,
        },
      }),
    );
  };
