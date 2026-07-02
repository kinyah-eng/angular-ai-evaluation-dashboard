export interface AppFeatureFlags {
  readonly auditTrail: boolean;
  readonly advancedAnalytics: boolean;
  readonly reviewerWorkload: boolean;
}

export interface AppEnvironment {
  readonly production: boolean;
  readonly applicationName: string;
  readonly applicationVersion: string;
  readonly apiBaseUrl: string;
  readonly storagePrefix: string;
  readonly features: AppFeatureFlags;
}
