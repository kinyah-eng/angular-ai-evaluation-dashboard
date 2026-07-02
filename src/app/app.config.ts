import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { APP_ENVIRONMENT } from './core/config/app-environment.token';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_ENVIRONMENT, useValue: environment },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
  ],
};
