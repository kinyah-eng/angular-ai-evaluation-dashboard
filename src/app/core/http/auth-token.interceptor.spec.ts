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
  vi,
} from 'vitest';

import { AuthService } from '../auth/auth.service';
import { AppConfigService } from '../config/app-config.service';
import { authTokenInterceptor } from './auth-token.interceptor';

describe(
  'authTokenInterceptor',
  () => {
    const authMock = {
      session: vi.fn(),
    };

    const configMock = {
      apiBaseUrl: '/api',
    };

    let http: HttpClient;
    let controller:
      HttpTestingController;

    beforeEach(() => {
      authMock.session.mockReturnValue({
        user: {
          id: 'USR-1',
          name: 'Test Admin',
          email: 'admin@test.dev',
          role: 'admin',
        },
        token: 'demo-token',
        expiresAt:
          Date.now() + 60_000,
      });

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              authTokenInterceptor,
            ]),
          ),
          provideHttpClientTesting(),
          {
            provide: AuthService,
            useValue: authMock,
          },
          {
            provide: AppConfigService,
            useValue: configMock,
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

    it('adds a bearer token to API requests', () => {
      http.get('/api/evaluations')
        .subscribe();

      const request =
        controller.expectOne(
          '/api/evaluations',
        );

      expect(
        request.request.headers.get(
          'Authorization',
        ),
      ).toBe('Bearer demo-token');

      request.flush([]);
    });

    it('does not modify external requests', () => {
      http.get(
        'https://example.com/data',
      ).subscribe();

      const request =
        controller.expectOne(
          'https://example.com/data',
        );

      expect(
        request.request.headers.has(
          'Authorization',
        ),
      ).toBe(false);

      request.flush({});
    });
  },
);
