import {
  computed,
  inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  exhaustMap,
  map,
  of,
  shareReplay,
  startWith,
} from 'rxjs';

import { AppConfigService } from '../config/app-config.service';
import {
  ApiConnectionState,
} from './api-connection.model';
import {
  ApiHealthResponse,
} from './api-health.model';

const INITIAL_STATE:
  ApiConnectionState = {
    status: 'checking',
    message: 'Checking API connection…',
  };

@Injectable({
  providedIn: 'root',
})
export class ApiHealthService {
  private readonly http =
    inject(HttpClient);

  private readonly config =
    inject(AppConfigService);

  private readonly refreshRequests =
    new BehaviorSubject<void>(undefined);

  private readonly healthUrl =
    `${this.config.apiBaseUrl.replace(/\/$/, '')}/health`;

  private readonly connectionState$ =
    this.refreshRequests.pipe(
      exhaustMap(() =>
        this.http
          .get<ApiHealthResponse>(
            this.healthUrl,
          )
          .pipe(
            map(
              (
                response,
              ): ApiConnectionState => ({
                status: 'online',
                service: response.service,
                version: response.version,
                checkedAt: new Date(
                  response.timestamp,
                ),
                message:
                  'API connection is operational.',
              }),
            ),

            catchError(() =>
              of<ApiConnectionState>({
                status: 'offline',
                checkedAt: new Date(),
                message:
                  'API connection is unavailable.',
              }),
            ),

            startWith<ApiConnectionState>({
              status: 'checking',
              message:
                'Checking API connection…',
            }),
          ),
      ),

      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );

  readonly state = toSignal(
    this.connectionState$,
    {
      initialValue: INITIAL_STATE,
    },
  );

  readonly isOnline = computed(
    () =>
      this.state().status === 'online',
  );

  readonly isChecking = computed(
    () =>
      this.state().status === 'checking',
  );

  refresh(): void {
    this.refreshRequests.next();
  }
}
