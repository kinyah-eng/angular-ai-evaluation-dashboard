import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EvaluationTaskStore } from './evaluation-task.store';

@Injectable({
  providedIn: 'root',
})
export class EvaluationFacade {
  private readonly store = inject(EvaluationTaskStore);

  readonly tasks$ = this.store.tasks$;

  getTask$(id: string): Observable<EvaluationTask | undefined> {
    return this.store.getTask$(id);
  }

  addTask(input: NewEvaluation): void {
    this.store.addTask(input);
  }

  updateTask(id: string, input: NewEvaluation): boolean {
    return this.store.updateTask(id, input);
  }

  completeTask(id: string): void {
    this.store.completeTask(id);
  }

  deleteTask(id: string): boolean {
    return this.store.deleteTask(id);
  }
}
