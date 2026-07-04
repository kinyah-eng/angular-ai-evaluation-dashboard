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
import { firstValueFrom } from 'rxjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { apiErrorInterceptor } from './api-error.interceptor';

describe(
  'apiErrorInterceptor',
  () => {
    let http: HttpClient;
    let controller:
      HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              apiErrorInterceptor,
            ]),
          ),
          provideHttpClientTesting(),
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

    it('maps server errors to ApplicationError', async () => {
      const responsePromise =
        firstValueFrom(
          http.get('/api/failure'),
        );

      const request =
        controller.expectOne(
          '/api/failure',
        );

      request.flush(
        {
          message:
            'Service unavailable',
        },
        {
          status: 503,
          statusText:
            'Service Unavailable',
        },
      );

      await expect(
        responsePromise,
      ).rejects.toMatchObject({
        code: 'network_error',
        userMessage:
          'The service is temporarily unavailable. Please try again.',
      });
    });
  },
);
