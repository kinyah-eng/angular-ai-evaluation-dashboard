import {
  inject,
  Injectable,
} from '@angular/core';
import { Observable } from 'rxjs';

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

  readonly tasks$ = this.store.tasks$;

  getTask$(
    id: string,
  ): Observable<EvaluationTask | undefined> {
    return this.store.getTask$(id);
  }

  addTask(input: NewEvaluation): void {
    this.store.addTask(input);

    this.notifications.success(
      'Evaluation created',
      `"${input.title.trim()}" was added to the workflow.`,
    );
  }

  updateTask(
    id: string,
    input: NewEvaluation,
  ): boolean {
    const updated =
      this.store.updateTask(id, input);

    if (updated) {
      this.notifications.success(
        'Evaluation updated',
        `${id} was updated successfully.`,
      );
    } else {
      this.notifications.error(
        'Update failed',
        `${id} could not be found.`,
      );
    }

    return updated;
  }

  completeTask(id: string): void {
    this.store.completeTask(id);

    this.notifications.success(
      'Evaluation completed',
      `${id} was marked as completed.`,
    );
  }

  deleteTask(id: string): boolean {
    const deleted =
      this.store.deleteTask(id);

    if (deleted) {
      this.notifications.warning(
        'Evaluation deleted',
        `${id} was removed from the workflow.`,
      );
    } else {
      this.notifications.error(
        'Deletion failed',
        `${id} could not be found.`,
      );
    }

    return deleted;
  }
}
