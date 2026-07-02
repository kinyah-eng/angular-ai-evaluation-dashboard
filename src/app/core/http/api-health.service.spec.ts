import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  TestBed,
} from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  AppConfigService,
} from '../config/app-config.service';
import {
  ApiHealthService,
} from './api-health.service';

describe('ApiHealthService', () => {
  let service: ApiHealthService;

  let controller:
    HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),

        ApiHealthService,

        {
          provide: AppConfigService,
          useValue: {
            apiBaseUrl: '/api',
          },
        },
      ],
    });

    service = TestBed.inject(
      ApiHealthService,
    );

    controller = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    controller.verify();
  });

  it('starts by checking the API', () => {
    expect(
      service.state().status,
    ).toBe('checking');

    const request =
      controller.expectOne(
        '/api/health',
      );

    request.flush({
      status: 'ok',
      service: 'EvalOps API',
      version: '1.0.0-test',
      timestamp:
        '2026-07-02T12:00:00.000Z',
    });
  });

  it('reports an online connection', () => {
    const request =
      controller.expectOne(
        '/api/health',
      );

    request.flush({
      status: 'ok',
      service: 'EvalOps API',
      version: '1.0.0-test',
      timestamp:
        '2026-07-02T12:00:00.000Z',
    });

    expect(service.state()).toEqual(
      expect.objectContaining({
        status: 'online',
        service: 'EvalOps API',
        version: '1.0.0-test',
        message:
          'API connection is operational.',
      }),
    );

    expect(
      service.isOnline(),
    ).toBe(true);
  });

  it('reports an offline connection', () => {
    const request =
      controller.expectOne(
        '/api/health',
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

    expect(
      service.state().status,
    ).toBe('offline');

    expect(
      service.state().message,
    ).toBe(
      'API connection is unavailable.',
    );
  });

  it('refreshes the API status manually', () => {
    const firstRequest =
      controller.expectOne(
        '/api/health',
      );

    firstRequest.flush({
      status: 'ok',
      service: 'EvalOps API',
      version: '1.0.0-test',
      timestamp:
        '2026-07-02T12:00:00.000Z',
    });

    service.refresh();

    expect(
      service.state().status,
    ).toBe('checking');

    const secondRequest =
      controller.expectOne(
        '/api/health',
      );

    secondRequest.flush({
      status: 'ok',
      service: 'EvalOps API',
      version: '1.0.1-test',
      timestamp:
        '2026-07-02T12:05:00.000Z',
    });

    expect(
      service.state().version,
    ).toBe('1.0.1-test');
  });
});
