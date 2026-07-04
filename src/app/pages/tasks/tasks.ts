import { AsyncPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  finalize,
  map,
  shareReplay,
  startWith,
  Subject,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationStatus } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-tasks-page',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './tasks.html',
  styleUrls: [
    '../page.scss',
    './tasks.scss',
  ],
})
export class TasksPage {
  private readonly evaluationFacade =
    inject(EvaluationFacade);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly completeRequests =
    new Subject<string>();

  protected readonly completingTaskId =
    signal<string | null>(null);

  protected readonly completionErrors =
    signal<Record<string, string>>(
      {},
    );

  protected readonly searchControl =
    new FormControl('', {
      nonNullable: true,
    });

  protected readonly statusControl =
    new FormControl<
      EvaluationStatus | 'All'
    >('All', {
      nonNullable: true,
    });

  protected readonly filteredTasks$ =
    combineLatest([
      this.evaluationFacade.tasks$,

      this.searchControl
        .valueChanges.pipe(
          startWith(
            this.searchControl.value,
          ),

          debounceTime(250),
          distinctUntilChanged(),
        ),

      this.statusControl
        .valueChanges.pipe(
          startWith(
            this.statusControl.value,
          ),

          distinctUntilChanged(),
        ),
    ]).pipe(
      map(
        ([
          tasks,
          searchTerm,
          selectedStatus,
        ]) => {
          const normalizedSearch =
            searchTerm
              .trim()
              .toLowerCase();

          return tasks.filter(
            (task) => {
              const matchesSearch =
                !normalizedSearch ||
                task.title
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ) ||
                task.category
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ) ||
                task.reviewer
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ) ||
                task.id
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  );

              const matchesStatus =
                selectedStatus ===
                  'All' ||
                task.status ===
                  selectedStatus;

              return (
                matchesSearch &&
                matchesStatus
              );
            },
          );
        },
      ),

      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );

  constructor() {
    this.completeRequests
      .pipe(
        exhaustMap((id) => {
          this.completingTaskId.set(id);
          this.clearCompletionError(id);

          return this.evaluationFacade
            .finishTask(id)
            .pipe(
              catchError(
                (error: unknown) => {
                  this.setCompletionError(
                    id,
                    this.getErrorMessage(
                      error,
                      `${id} could not be completed.`,
                    ),
                  );

                  return EMPTY;
                },
              ),

              finalize(() => {
                this.completingTaskId.set(
                  null,
                );
              }),
            );
        }),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe();
  }

  protected completeTask(
    id: string,
  ): void {
    if (this.hasPendingCompletion()) {
      return;
    }

    this.completeRequests.next(id);
  }

  protected isCompleting(
    id: string,
  ): boolean {
    return (
      this.completingTaskId() === id
    );
  }

  protected hasPendingCompletion():
    boolean {
    return (
      this.completingTaskId() !==
      null
    );
  }

  protected completionError(
    id: string,
  ): string | undefined {
    return this.completionErrors()[
      id
    ];
  }

  private clearCompletionError(
    id: string,
  ): void {
    this.completionErrors.update(
      (errors) => {
        const nextErrors = {
          ...errors,
        };

        delete nextErrors[id];

        return nextErrors;
      },
    );
  }

  private setCompletionError(
    id: string,
    message: string,
  ): void {
    this.completionErrors.update(
      (errors) => ({
        ...errors,
        [id]: message,
      }),
    );
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
