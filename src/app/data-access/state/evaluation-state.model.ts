import { EvaluationTask } from '../models/evaluation-task.model';

export type EvaluationLoadStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export interface EvaluationState {
  readonly tasks: readonly EvaluationTask[];
  readonly loadStatus: EvaluationLoadStatus;
  readonly errorMessage: string | null;
  readonly pendingOperations: readonly string[];
}
