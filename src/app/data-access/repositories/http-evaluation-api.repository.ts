import {
  inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from '../../core/config/app-config.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EvaluationApiRepository } from './evaluation-api.repository';

@Injectable({
  providedIn: 'root',
})
export class HttpEvaluationApiRepository
  implements EvaluationApiRepository
{
  private readonly http =
    inject(HttpClient);

  private readonly config =
    inject(AppConfigService);

  private readonly collectionUrl =
    `${this.config.apiBaseUrl.replace(/\/$/, '')}/evaluations`;

  list(): Observable<
    readonly EvaluationTask[]
  > {
    return this.http.get<
      readonly EvaluationTask[]
    >(this.collectionUrl);
  }

  getById(
    id: string,
  ): Observable<EvaluationTask> {
    return this.http.get<EvaluationTask>(
      this.resourceUrl(id),
    );
  }

  create(
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    return this.http.post<EvaluationTask>(
      this.collectionUrl,
      input,
    );
  }

  update(
    id: string,
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    return this.http.put<EvaluationTask>(
      this.resourceUrl(id),
      input,
    );
  }

  complete(
    id: string,
  ): Observable<EvaluationTask> {
    return this.http.patch<EvaluationTask>(
      this.resourceUrl(id),
      {
        status: 'Completed',
      },
    );
  }

  delete(
    id: string,
  ): Observable<void> {
    return this.http.delete<void>(
      this.resourceUrl(id),
    );
  }

  private resourceUrl(
    id: string,
  ): string {
    return (
      `${this.collectionUrl}/` +
      encodeURIComponent(id)
    );
  }
}
