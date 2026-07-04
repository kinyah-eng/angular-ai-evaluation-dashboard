import { InjectionToken } from '@angular/core';

import { EvaluationTask } from '../models/evaluation-task.model';

export interface EvaluationTaskRepository {
  load(): EvaluationTask[] | null;
  save(tasks: readonly EvaluationTask[]): void;
  clear(): void;
}

export const EVALUATION_TASK_REPOSITORY =
  new InjectionToken<EvaluationTaskRepository>(
    'EVALUATION_TASK_REPOSITORY',
  );
