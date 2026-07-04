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
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

type TaskAction = Readonly<{
  type: 'complete' | 'delete';
  id: string;
}>;

@Component({
  selector: 'app-task-details-page',
  imports: [
    AsyncPipe,
    RouterLink,
  ],
  templateUrl:
    './task-details.html',
  styleUrls: [
    '../page.scss',
    './task-details.scss',
  ],
})
export class TaskDetailsPage {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly evaluationFacade =
    inject(EvaluationFacade);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly actionRequests =
    new Subject<TaskAction>();

  protected readonly activeAction =
    signal<TaskAction | null>(null);

  protected readonly actionError =
    signal<string | null>(null);

  protected readonly task$ =
    this.route.paramMap.pipe(
      map(
        (parameters) =>
          parameters.get('id') ?? '',
      ),

      switchMap((id) =>
        this.evaluationFacade
          .getTask$(id),
      ),

      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );

  constructor() {
    this.actionRequests
      .pipe(
        exhaustMap((action) => {
          this.activeAction.set(action);
          this.actionError.set(null);

          return this.runAction(
            action,
          ).pipe(
            finalize(() => {
              this.activeAction.set(
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
    if (this.activeAction()) {
      return;
    }

    this.actionRequests.next({
      type: 'complete',
      id,
    });
  }

  protected deleteTask(
    id: string,
  ): void {
    if (this.activeAction()) {
      return;
    }

    const confirmed =
      window.confirm(
        'Delete this evaluation permanently?',
      );

    if (!confirmed) {
      return;
    }

    this.actionRequests.next({
      type: 'delete',
      id,
    });
  }

  protected isCompleting(
    id: string,
  ): boolean {
    const action =
      this.activeAction();

    return (
      action?.type === 'complete' &&
      action.id === id
    );
  }

  protected isDeleting(
    id: string,
  ): boolean {
    const action =
      this.activeAction();

    return (
      action?.type === 'delete' &&
      action.id === id
    );
  }

  protected actionPending(): boolean {
    return this.activeAction() !== null;
  }

  private runAction(
    action: TaskAction,
  ): Observable<unknown> {
    if (action.type === 'complete') {
      return this.evaluationFacade
        .finishTask(action.id)
        .pipe(
          catchError(
            (error: unknown) => {
              this.actionError.set(
                this.getErrorMessage(
                  error,
                  `${action.id} could not be completed.`,
                ),
              );

              return EMPTY;
            },
          ),
        );
    }

    return this.evaluationFacade
      .removeTask(action.id)
      .pipe(
        tap(() => {
          void this.router.navigate([
            '/tasks',
          ]);
        }),

        catchError(
          (error: unknown) => {
            this.actionError.set(
              this.getErrorMessage(
                error,
                `${action.id} could not be deleted.`,
              ),
            );

            return EMPTY;
          },
        ),
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
