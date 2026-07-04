import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  provideRouter,
  withHashLocation,
} from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { APP_ENVIRONMENT } from './core/config/app-environment.token';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { authTokenInterceptor } from './core/http/auth-token.interceptor';
import { mockApiInterceptor } from './core/http/mock-api.interceptor';
import { requestContextInterceptor } from './core/http/request-context.interceptor';
import { EVALUATION_API_REPOSITORY } from './data-access/repositories/evaluation-api.repository';
import { HttpEvaluationApiRepository } from './data-access/repositories/http-evaluation-api.repository';

export const appConfig:
  ApplicationConfig = {
    providers: [
      provideBrowserGlobalErrorListeners(),

      provideZoneChangeDetection({
        eventCoalescing: true,
      }),

      provideRouter(
        routes,
        withHashLocation(),
      ),

      provideHttpClient(
        withInterceptors([
          authTokenInterceptor,
          requestContextInterceptor,
          apiErrorInterceptor,
          mockApiInterceptor,
        ]),
      ),

      {
        provide: APP_ENVIRONMENT,
        useValue: environment,
      },

      {
        provide:
          EVALUATION_API_REPOSITORY,
        useExisting:
          HttpEvaluationApiRepository,
      },

      {
        provide: ErrorHandler,
        useClass: GlobalErrorHandler,
      },
    ],
  };
