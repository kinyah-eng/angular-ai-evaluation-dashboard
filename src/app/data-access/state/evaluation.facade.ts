import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Observable,
  take,
} from 'rxjs';

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

  addTask(
    input: NewEvaluation,
  ): void {
    this.store
      .addTask(input)
      .pipe(take(1))
      .subscribe({
        next: (task) => {
          this.notifications.success(
            'Evaluation created',
            `"${task.title}" was added to the workflow.`,
          );
        },

        error: () => {
          this.notifications.error(
            'Creation failed',
            'The evaluation could not be created.',
          );
        },
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

    this.store
      .updateTask(id, input)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notifications.success(
            'Evaluation updated',
            `${id} was updated successfully.`,
          );
        },

        error: () => {
          this.notifications.error(
            'Update failed',
            `${id} could not be updated.`,
          );
        },
      });

    return true;
  }

  completeTask(id: string): void {
    if (!this.store.hasTask(id)) {
      this.notifications.error(
        'Completion failed',
        `${id} could not be found.`,
      );

      return;
    }

    this.store
      .completeTask(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notifications.success(
            'Evaluation completed',
            `${id} was marked as completed.`,
          );
        },

        error: () => {
          this.notifications.error(
            'Completion failed',
            `${id} could not be completed.`,
          );
        },
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

    this.store
      .deleteTask(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notifications.warning(
            'Evaluation deleted',
            `${id} was removed from the workflow.`,
          );
        },

        error: () => {
          this.notifications.error(
            'Deletion failed',
            `${id} could not be deleted.`,
          );
        },
      });

    return true;
  }
}
