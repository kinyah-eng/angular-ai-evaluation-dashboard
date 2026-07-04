import {
  inject,
  Injectable,
} from '@angular/core';
import {
  catchError,
  Observable,
  take,
  tap,
  throwError,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { NotificationService } from '../../core/services/notification.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EvaluationTaskStore } from './evaluation-task.store';

@Injectable({
  providedIn: 'root',
})
export class EvaluationFacade {
  private readonly store =
    inject(EvaluationTaskStore);

  private readonly notifications =
    inject(NotificationService);

  readonly tasks$ =
    this.store.tasks$;

  readonly loading$ =
    this.store.loading$;

  readonly error$ =
    this.store.error$;

  readonly pendingOperations$ =
    this.store.pendingOperations$;

  getTask$(
    id: string,
  ): Observable<
    EvaluationTask | undefined
  > {
    return this.store.getTask$(id);
  }

  reload(): void {
    this.store.reload();
  }

  clearError(): void {
    this.store.clearError();
  }

  createTask(
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    return this.store
      .addTask(input)
      .pipe(
        tap((task) => {
          this.notifications.success(
            'Evaluation created',
            `"${task.title}" was added to the workflow.`,
          );
        }),

        catchError((error: unknown) => {
          this.notifications.error(
            'Creation failed',
            this.getErrorMessage(
              error,
              'The evaluation could not be created.',
            ),
          );

          return throwError(
            () => error,
          );
        }),
      );
  }

  saveTask(
    id: string,
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    if (!this.store.hasTask(id)) {
      const error =
        new ApplicationError(
          'not_found',
          `${id} does not exist in the evaluation store.`,
          `${id} could not be found.`,
        );

      this.notifications.error(
        'Update failed',
        error.userMessage,
      );

      return throwError(
        () => error,
      );
    }

    return this.store
      .updateTask(id, input)
      .pipe(
        tap(() => {
          this.notifications.success(
            'Evaluation updated',
            `${id} was updated successfully.`,
          );
        }),

        catchError((error: unknown) => {
          this.notifications.error(
            'Update failed',
            this.getErrorMessage(
              error,
              `${id} could not be updated.`,
            ),
          );

          return throwError(
            () => error,
          );
        }),
      );
  }

  finishTask(
    id: string,
  ): Observable<EvaluationTask> {
    if (!this.store.hasTask(id)) {
      const error =
        new ApplicationError(
          'not_found',
          `${id} does not exist in the evaluation store.`,
          `${id} could not be found.`,
        );

      this.notifications.error(
        'Completion failed',
        error.userMessage,
      );

      return throwError(
        () => error,
      );
    }

    return this.store
      .completeTask(id)
      .pipe(
        tap(() => {
          this.notifications.success(
            'Evaluation completed',
            `${id} was marked as completed.`,
          );
        }),

        catchError((error: unknown) => {
          this.notifications.error(
            'Completion failed',
            this.getErrorMessage(
              error,
              `${id} could not be completed.`,
            ),
          );

          return throwError(
            () => error,
          );
        }),
      );
  }

  removeTask(
    id: string,
  ): Observable<void> {
    if (!this.store.hasTask(id)) {
      const error =
        new ApplicationError(
          'not_found',
          `${id} does not exist in the evaluation store.`,
          `${id} could not be found.`,
        );

      this.notifications.error(
        'Deletion failed',
        error.userMessage,
      );

      return throwError(
        () => error,
      );
    }

    return this.store
      .deleteTask(id)
      .pipe(
        tap(() => {
          this.notifications.warning(
            'Evaluation deleted',
            `${id} was removed from the workflow.`,
          );
        }),

        catchError((error: unknown) => {
          this.notifications.error(
            'Deletion failed',
            this.getErrorMessage(
              error,
              `${id} could not be deleted.`,
            ),
          );

          return throwError(
            () => error,
          );
        }),
      );
  }

  /*
   * Compatibility commands for existing task-list,
   * review, and task-details actions.
   *
   * The create and edit pages use the observable
   * commands above so they can wait for confirmed
   * API success before navigating.
   */

  addTask(
    input: NewEvaluation,
  ): void {
    this.createTask(input)
      .pipe(take(1))
      .subscribe({
        error: () => undefined,
      });
  }

  updateTask(
    id: string,
    input: NewEvaluation,
  ): boolean {
    if (!this.store.hasTask(id)) {
      this.notifications.error(
        'Update failed',
        `${id} could not be found.`,
      );

      return false;
    }

    this.saveTask(id, input)
      .pipe(take(1))
      .subscribe({
        error: () => undefined,
      });

    return true;
  }

  completeTask(id: string): void {
    this.finishTask(id)
      .pipe(take(1))
      .subscribe({
        error: () => undefined,
      });
  }

  deleteTask(id: string): boolean {
    if (!this.store.hasTask(id)) {
      this.notifications.error(
        'Deletion failed',
        `${id} could not be found.`,
      );

      return false;
    }

    this.removeTask(id)
      .pipe(take(1))
      .subscribe({
        error: () => undefined,
      });

    return true;
  }

  private getErrorMessage(
    error: unknown,
    fallback: string,
  ): string {
    if (
      error instanceof
      ApplicationError
    ) {
      return error.userMessage;
    }

    return fallback;
  }
}
