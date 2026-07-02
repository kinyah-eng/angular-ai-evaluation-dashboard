import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
} from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { APP_ENVIRONMENT } from './core/config/app-environment.token';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { EVALUATION_TASK_REPOSITORY } from './data-access/repositories/evaluation-task.repository';
import { LocalStorageEvaluationTaskRepository } from './data-access/repositories/local-storage-evaluation-task.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    provideRouter(
      routes,
      withHashLocation(),
    ),
    {
      provide: APP_ENVIRONMENT,
      useValue: environment,
    },
    {
      provide: EVALUATION_TASK_REPOSITORY,
      useClass:
        LocalStorageEvaluationTaskRepository,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
};
