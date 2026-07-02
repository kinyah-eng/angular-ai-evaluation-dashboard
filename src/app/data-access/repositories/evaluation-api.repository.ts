import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';

export interface EvaluationApiRepository {
  list(): Observable<
    readonly EvaluationTask[]
  >;

  getById(
    id: string,
  ): Observable<EvaluationTask>;

  create(
    input: NewEvaluation,
  ): Observable<EvaluationTask>;

  update(
    id: string,
    input: NewEvaluation,
  ): Observable<EvaluationTask>;

  complete(
    id: string,
  ): Observable<EvaluationTask>;

  delete(
    id: string,
  ): Observable<void>;
}

export const EVALUATION_API_REPOSITORY =
  new InjectionToken<EvaluationApiRepository>(
    'EVALUATION_API_REPOSITORY',
  );
