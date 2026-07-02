import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { AppConfigService } from '../config/app-config.service';
import { ApiHealthResponse } from './api-health.model';
import { mockApiInterceptor } from './mock-api.interceptor';

describe(
  'mockApiInterceptor',
  () => {
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              mockApiInterceptor,
            ]),
          ),
          {
            provide: AppConfigService,
            useValue: {
              apiBaseUrl: '/api',
              applicationVersion:
                '1.0.0-test',
            },
          },
        ],
      });

      http = TestBed.inject(HttpClient);
    });

    it('returns API health information', async () => {
      const response =
        await firstValueFrom(
          http.get<ApiHealthResponse>(
            '/api/health',
          ),
        );

      expect(response).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'EvalOps API',
          version: '1.0.0-test',
        }),
      );
    });
  },
);
