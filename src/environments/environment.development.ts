import { AppEnvironment } from '../app/core/config/app-environment.model';

export const environment = {
  production: false,
  applicationName: 'EvalOps Development',
  applicationVersion: '1.0.0-dev',
  apiBaseUrl: 'http://localhost:3000/api',
  storagePrefix: 'evalops-dev',
  features: {
    auditTrail: true,
    advancedAnalytics: true,
    reviewerWorkload: false,
  },
} satisfies AppEnvironment;
