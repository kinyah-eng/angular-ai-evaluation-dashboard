import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import {
  delay,
  of,
} from 'rxjs';

import { AppConfigService } from '../config/app-config.service';
import { ApiHealthResponse } from './api-health.model';

export const mockApiInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const config = inject(AppConfigService);

    const baseUrl =
      config.apiBaseUrl.replace(/\/$/, '');

    if (
      request.method === 'GET' &&
      request.url === `${baseUrl}/health`
    ) {
      const body: ApiHealthResponse = {
        status: 'ok',
        service: 'EvalOps API',
        version:
          config.applicationVersion,
        timestamp:
          new Date().toISOString(),
      };

      return of(
        new HttpResponse({
          status: 200,
          body,
        }),
      ).pipe(delay(200));
    }

    return next(request);
  };
