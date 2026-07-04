import { inject, Injectable } from '@angular/core';

import {
  AppEnvironment,
  AppFeatureFlags,
} from './app-environment.model';
import { APP_ENVIRONMENT } from './app-environment.token';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly environment = inject(APP_ENVIRONMENT);

  readonly applicationName =
    this.environment.applicationName;

  readonly applicationVersion =
    this.environment.applicationVersion;

  readonly apiBaseUrl =
    this.environment.apiBaseUrl;

  readonly storagePrefix =
    this.environment.storagePrefix;

  readonly production =
    this.environment.production;

  isFeatureEnabled(
    feature: keyof AppFeatureFlags,
  ): boolean {
    return this.environment.features[feature];
  }

  getSnapshot(): Readonly<AppEnvironment> {
    return this.environment;
  }
}
