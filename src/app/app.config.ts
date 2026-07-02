import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { APP_ENVIRONMENT } from './core/config/app-environment.token';
import { EVALUATION_TASK_REPOSITORY } from './data-access/repositories/evaluation-task.repository';
import { LocalStorageEvaluationTaskRepository } from './data-access/repositories/local-storage-evaluation-task.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: EVALUATION_TASK_REPOSITORY,
      useClass: LocalStorageEvaluationTaskRepository,
    },
    { provide: APP_ENVIRONMENT, useValue: environment },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
  ],
};
