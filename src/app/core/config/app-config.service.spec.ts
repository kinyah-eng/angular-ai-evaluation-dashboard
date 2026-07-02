import { TestBed } from '@angular/core/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { AppEnvironment } from './app-environment.model';
import { APP_ENVIRONMENT } from './app-environment.token';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  const testEnvironment: AppEnvironment = {
    production: false,
    applicationName: 'EvalOps Test',
    applicationVersion: '1.0.0-test',
    apiBaseUrl: 'http://localhost:4000/api',
    storagePrefix: 'evalops-test',
    features: {
      auditTrail: true,
      advancedAnalytics: false,
      reviewerWorkload: true,
    },
  };

  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppConfigService,
        {
          provide: APP_ENVIRONMENT,
          useValue: testEnvironment,
        },
      ],
    });

    service = TestBed.inject(AppConfigService);
  });

  it('exposes typed application configuration', () => {
    expect(service.applicationName).toBe(
      'EvalOps Test',
    );

    expect(service.applicationVersion).toBe(
      '1.0.0-test',
    );

    expect(service.apiBaseUrl).toBe(
      'http://localhost:4000/api',
    );

    expect(service.storagePrefix).toBe(
      'evalops-test',
    );

    expect(service.production).toBe(false);
  });

  it('returns enabled feature flags', () => {
    expect(
      service.isFeatureEnabled('auditTrail'),
    ).toBe(true);

    expect(
      service.isFeatureEnabled('reviewerWorkload'),
    ).toBe(true);
  });

  it('returns disabled feature flags', () => {
    expect(
      service.isFeatureEnabled('advancedAnalytics'),
    ).toBe(false);
  });

  it('returns the complete configuration snapshot', () => {
    expect(service.getSnapshot()).toEqual(
      testEnvironment,
    );
  });
});
