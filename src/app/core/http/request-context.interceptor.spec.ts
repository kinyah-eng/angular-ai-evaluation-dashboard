import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { AppConfigService } from '../config/app-config.service';
import { requestContextInterceptor } from './request-context.interceptor';

describe(
  'requestContextInterceptor',
  () => {
    let http: HttpClient;
    let controller:
      HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              requestContextInterceptor,
            ]),
          ),
          provideHttpClientTesting(),
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

      controller = TestBed.inject(
        HttpTestingController,
      );
    });

    afterEach(() => {
      controller.verify();
    });

    it('adds request context headers', () => {
      http.get('/api/health')
        .subscribe();

      const request =
        controller.expectOne('/api/health');

      expect(
        request.request.headers.get(
          'X-Request-ID',
        ),
      ).toBeTruthy();

      expect(
        request.request.headers.get(
          'X-Client-Version',
        ),
      ).toBe('1.0.0-test');

      request.flush({});
    });
  },
);
