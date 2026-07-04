import { AppEnvironment } from '../app/core/config/app-environment.model';

export const environment = {
  production: true,
  applicationName: 'EvalOps',
  applicationVersion: '1.0.0',
  apiBaseUrl: '/api',
  storagePrefix: 'evalops',
  features: {
    auditTrail: true,
    advancedAnalytics: true,
    reviewerWorkload: true,
  },
} satisfies AppEnvironment;
