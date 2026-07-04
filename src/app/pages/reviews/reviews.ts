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
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  map,
  Subject,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-reviews-page',
  imports: [AsyncPipe],
  templateUrl: './reviews.html',
  styleUrls: [
    '../page.scss',
    './reviews.scss',
  ],
})
export class ReviewsPage {
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

  protected readonly pendingReviews$ =
    this.evaluationFacade.tasks$.pipe(
      map((tasks) =>
        tasks.filter(
          (task) =>
            task.status !==
            'Completed',
        ),
      ),
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

  protected completeReview(
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
