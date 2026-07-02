import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import {
  EvaluationStatus,
  EvaluationStatusKey,
  EvaluationTask,
  NewEvaluation,
} from './evaluation-task';

const STORAGE_KEY = 'evalops-evaluation-tasks';

const INITIAL_TASKS: EvaluationTask[] = [
  {
    id: 'EV-1042',
    title: 'Angular reactive form validation',
    category: 'Code Review',
    reviewer: 'Samuel Kamande',
    status: 'In Review',
    statusKey: 'review',
    qualityScore: 92,
  },
  {
    id: 'EV-1041',
    title: 'RxJS subscription leak analysis',
    category: 'Debugging',
    reviewer: 'Amina Noor',
    status: 'Completed',
    statusKey: 'completed',
    qualityScore: 98,
  },
  {
    id: 'EV-1040',
    title: 'SCSS architecture assessment',
    category: 'Maintainability',
    reviewer: 'Samuel Kamande',
    status: 'Needs Attention',
    statusKey: 'attention',
    qualityScore: 76,
  },
  {
    id: 'EV-1039',
    title: 'Angular component accessibility',
    category: 'Accessibility',
    reviewer: 'Daniel Otieno',
    status: 'Completed',
    statusKey: 'completed',
    qualityScore: 96,
  },
];

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private readonly tasksSubject =
    new BehaviorSubject<EvaluationTask[]>(this.loadTasks());

  readonly tasks$ = this.tasksSubject.asObservable();

  getTask$(id: string): Observable<EvaluationTask | undefined> {
    return this.tasks$.pipe(
      map((tasks) => tasks.find((task) => task.id === id)),
    );
  }

  addTask(input: NewEvaluation): void {
    const currentTasks = this.tasksSubject.value;

    const existingNumbers = currentTasks
      .map((task) => Number(task.id.replace(/\D/g, '')))
      .filter((value) => Number.isFinite(value));

    const nextNumber = Math.max(1042, ...existingNumbers) + 1;

    const newTask: EvaluationTask = {
      id: `EV-${nextNumber}`,
      title: input.title.trim(),
      category: input.category,
      reviewer: input.reviewer.trim(),
      status: input.status,
      statusKey: this.getStatusKey(input.status),
      qualityScore: input.status === 'Completed' ? 95 : 0,
    };

    this.updateTasks([newTask, ...currentTasks]);
  }

  updateTask(id: string, input: NewEvaluation): boolean {
    let taskFound = false;

    const updatedTasks = this.tasksSubject.value.map((task) => {
      if (task.id !== id) {
        return task;
      }

      taskFound = true;

      return {
        ...task,
        title: input.title.trim(),
        category: input.category,
        reviewer: input.reviewer.trim(),
        status: input.status,
        statusKey: this.getStatusKey(input.status),
        qualityScore:
          input.status === 'Completed'
            ? task.qualityScore || 95
            : task.qualityScore,
      };
    });

    if (taskFound) {
      this.updateTasks(updatedTasks);
    }

    return taskFound;
  }

  completeTask(id: string): void {
    const updatedTasks = this.tasksSubject.value.map((task) =>
      task.id === id
        ? {
            ...task,
            status: 'Completed' as const,
            statusKey: 'completed' as const,
            qualityScore: task.qualityScore || 95,
          }
        : task,
    );

    this.updateTasks(updatedTasks);
  }

  deleteTask(id: string): boolean {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.filter((task) => task.id !== id);

    if (updatedTasks.length === currentTasks.length) {
      return false;
    }

    this.updateTasks(updatedTasks);
    return true;
  }

  private updateTasks(tasks: EvaluationTask[]): void {
    this.tasksSubject.next(tasks);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Continue without persistence when browser storage is unavailable.
    }
  }

  private loadTasks(): EvaluationTask[] {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);

      if (storedTasks) {
        return JSON.parse(storedTasks) as EvaluationTask[];
      }
    } catch {
      // Fall back to demonstration data.
    }

    return INITIAL_TASKS;
  }

  private getStatusKey(status: EvaluationStatus): EvaluationStatusKey {
    switch (status) {
      case 'Completed':
        return 'completed';
      case 'Needs Attention':
        return 'attention';
      default:
        return 'review';
    }
  }
}
