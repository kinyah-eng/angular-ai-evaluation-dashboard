import {
  inject,
  Injectable,
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  defer,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  take,
  tap,
  throwError,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EVALUATION_API_REPOSITORY } from '../repositories/evaluation-api.repository';
import { EvaluationState } from './evaluation-state.model';

const INITIAL_STATE: EvaluationState = {
  tasks: [],
  loadStatus: 'idle',
  errorMessage: null,
  pendingOperations: [],
};

@Injectable({
  providedIn: 'root',
})
export class EvaluationTaskStore {
  private readonly api = inject(
    EVALUATION_API_REPOSITORY,
  );

  private readonly stateSubject =
    new BehaviorSubject<EvaluationState>(
      INITIAL_STATE,
    );

  readonly state$ =
    this.stateSubject.asObservable();

  readonly tasks$ = this.state$.pipe(
    map((state) => state.tasks),
    distinctUntilChanged(),
  );

  readonly loading$ = this.state$.pipe(
    map(
      (state) =>
        state.loadStatus === 'loading',
    ),
    distinctUntilChanged(),
  );

  readonly error$ = this.state$.pipe(
    map((state) => state.errorMessage),
    distinctUntilChanged(),
  );

  readonly pendingOperations$ =
    this.state$.pipe(
      map(
        (state) =>
          state.pendingOperations,
      ),
      distinctUntilChanged(),
    );

  constructor() {
    this.reload();
  }

  reload(): void {
    if (
      this.stateSubject.value
        .loadStatus === 'loading'
    ) {
      return;
    }

    this.patchState({
      loadStatus: 'loading',
      errorMessage: null,
    });

    this.api
      .list()
      .pipe(take(1))
      .subscribe({
        next: (tasks) => {
          this.patchState({
            tasks: [...tasks],
            loadStatus: 'ready',
            errorMessage: null,
          });
        },

        error: (error: unknown) => {
          this.patchState({
            loadStatus: 'error',
            errorMessage:
              this.getErrorMessage(error),
          });
        },
      });
  }

  getTask$(
    id: string,
  ): Observable<
    EvaluationTask | undefined
  > {
    return this.state$.pipe(
      filter(
        (state) =>
          state.loadStatus === 'ready' ||
          state.loadStatus === 'error',
      ),

      map((state) =>
        state.tasks.find(
          (task) => task.id === id,
        ),
      ),

      distinctUntilChanged(),
    );
  }

  hasTask(id: string): boolean {
    return this.stateSubject.value.tasks
      .some((task) => task.id === id);
  }

  addTask(
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    return this.runMutation(
      'create',
      () => this.api.create(input),
    ).pipe(
      tap((createdTask) => {
        this.patchState({
          tasks: [
            createdTask,
            ...this.stateSubject.value
              .tasks,
          ],
          errorMessage: null,
        });
      }),
    );
  }

  updateTask(
    id: string,
    input: NewEvaluation,
  ): Observable<EvaluationTask> {
    return this.runMutation(
      `update:${id}`,
      () => this.api.update(id, input),
    ).pipe(
      tap((updatedTask) => {
        this.patchState({
          tasks:
            this.stateSubject.value.tasks
              .map((task) =>
                task.id === id
                  ? updatedTask
                  : task,
              ),
          errorMessage: null,
        });
      }),
    );
  }

  completeTask(
    id: string,
  ): Observable<EvaluationTask> {
    return this.runMutation(
      `complete:${id}`,
      () => this.api.complete(id),
    ).pipe(
      tap((completedTask) => {
        this.patchState({
          tasks:
            this.stateSubject.value.tasks
              .map((task) =>
                task.id === id
                  ? completedTask
                  : task,
              ),
          errorMessage: null,
        });
      }),
    );
  }

  deleteTask(
    id: string,
  ): Observable<void> {
    return this.runMutation(
      `delete:${id}`,
      () => this.api.delete(id),
    ).pipe(
      tap(() => {
        this.patchState({
          tasks:
            this.stateSubject.value.tasks
              .filter(
                (task) =>
                  task.id !== id,
              ),
          errorMessage: null,
        });
      }),
    );
  }

  clearError(): void {
    this.patchState({
      errorMessage: null,
    });
  }

  private runMutation<T>(
    operation: string,
    requestFactory:
      () => Observable<T>,
  ): Observable<T> {
    return defer(() => {
      this.addPendingOperation(
        operation,
      );

      return requestFactory().pipe(
        catchError(
          (error: unknown) => {
            this.patchState({
              errorMessage:
                this.getErrorMessage(
                  error,
                ),
            });

            return throwError(
              () => error,
            );
          },
        ),

        finalize(() => {
          this.removePendingOperation(
            operation,
          );
        }),
      );
    });
  }

  private addPendingOperation(
    operation: string,
  ): void {
    const pendingOperations =
      this.stateSubject.value
        .pendingOperations;

    if (
      pendingOperations.includes(
        operation,
      )
    ) {
      return;
    }

    this.patchState({
      pendingOperations: [
        ...pendingOperations,
        operation,
      ],
    });
  }

  private removePendingOperation(
    operation: string,
  ): void {
    this.patchState({
      pendingOperations:
        this.stateSubject.value
          .pendingOperations
          .filter(
            (candidate) =>
              candidate !== operation,
          ),
    });
  }

  private patchState(
    patch: Partial<EvaluationState>,
  ): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...patch,
    });
  }

  private getErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof
      ApplicationError
    ) {
      return error.userMessage;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return (
      'The evaluation operation ' +
      'could not be completed.'
    );
  }
}
