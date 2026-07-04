import { inject, Injectable } from '@angular/core';

import { AppConfigService } from '../../core/config/app-config.service';
import { EvaluationTask } from '../models/evaluation-task.model';
import { EvaluationTaskRepository } from './evaluation-task.repository';

@Injectable()
export class LocalStorageEvaluationTaskRepository
  implements EvaluationTaskRepository
{
  private readonly config = inject(AppConfigService);

  private get storageKey(): string {
    return `${this.config.storagePrefix}-evaluation-tasks`;
  }

  load(): EvaluationTask[] | null {
    try {
      const storedValue = localStorage.getItem(this.storageKey);

      if (!storedValue) {
        return null;
      }

      const parsedValue: unknown = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        return null;
      }

      return parsedValue as EvaluationTask[];
    } catch {
      return null;
    }
  }

  save(tasks: readonly EvaluationTask[]): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(tasks),
      );
    } catch {
      // Persistence failures must not prevent the UI from working.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore unavailable or restricted browser storage.
    }
  }
}
