import { Injectable } from '@angular/core';

import {
  EvaluationStatus,
  EvaluationStatusKey,
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';

const INITIAL_MOCK_TASKS:
  readonly EvaluationTask[] = [
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
export class MockEvaluationApiService {
  private tasks: EvaluationTask[] = [];

  constructor() {
    this.reset();
  }

  list(): readonly EvaluationTask[] {
    return this.tasks.map(
      (task) => ({ ...task }),
    );
  }

  getById(
    id: string,
  ): EvaluationTask | undefined {
    const task = this.tasks.find(
      (candidate) => candidate.id === id,
    );

    return task
      ? { ...task }
      : undefined;
  }

  create(
    input: NewEvaluation,
  ): EvaluationTask {
    const existingNumbers = this.tasks
      .map((task) =>
        Number(
          task.id.replace(/\D/g, ''),
        ),
      )
      .filter(Number.isFinite);

    const nextNumber =
      Math.max(
        1042,
        ...existingNumbers,
      ) + 1;

    const createdTask:
      EvaluationTask = {
        id: `EV-${nextNumber}`,
        title: input.title.trim(),
        category: input.category.trim(),
        reviewer: input.reviewer.trim(),
        status: input.status,
        statusKey:
          this.getStatusKey(input.status),
        qualityScore:
          input.status === 'Completed'
            ? 95
            : 0,
      };

    this.tasks = [
      createdTask,
      ...this.tasks,
    ];

    return { ...createdTask };
  }

  update(
    id: string,
    input: NewEvaluation,
  ): EvaluationTask | undefined {
    const index = this.tasks.findIndex(
      (task) => task.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    const currentTask =
      this.tasks[index];

    const updatedTask:
      EvaluationTask = {
        ...currentTask,
        title: input.title.trim(),
        category: input.category.trim(),
        reviewer: input.reviewer.trim(),
        status: input.status,
        statusKey:
          this.getStatusKey(input.status),
        qualityScore:
          input.status === 'Completed'
            ? currentTask.qualityScore || 95
            : currentTask.qualityScore,
      };

    this.tasks = this.tasks.map(
      (task) =>
        task.id === id
          ? updatedTask
          : task,
    );

    return { ...updatedTask };
  }

  complete(
    id: string,
  ): EvaluationTask | undefined {
    const task = this.getById(id);

    if (!task) {
      return undefined;
    }

    const completedTask:
      EvaluationTask = {
        ...task,
        status: 'Completed',
        statusKey: 'completed',
        qualityScore:
          task.qualityScore || 95,
      };

    this.tasks = this.tasks.map(
      (candidate) =>
        candidate.id === id
          ? completedTask
          : candidate,
    );

    return { ...completedTask };
  }

  delete(id: string): boolean {
    const initialLength =
      this.tasks.length;

    this.tasks = this.tasks.filter(
      (task) => task.id !== id,
    );

    return (
      this.tasks.length <
      initialLength
    );
  }

  reset(): void {
    this.tasks =
      INITIAL_MOCK_TASKS.map(
        (task) => ({ ...task }),
      );
  }

  private getStatusKey(
    status: EvaluationStatus,
  ): EvaluationStatusKey {
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
