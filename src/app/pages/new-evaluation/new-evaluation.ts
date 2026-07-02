import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  Subject,
  tap,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationStatus } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-new-evaluation-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl:
    './new-evaluation.html',
  styleUrls: [
    '../page.scss',
    './new-evaluation.scss',
  ],
})
export class NewEvaluationPage {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly evaluationFacade =
    inject(EvaluationFacade);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly submitRequests =
    new Subject<void>();

  protected readonly submitting =
    signal(false);

  protected readonly submitError =
    signal<string | null>(null);

  protected readonly evaluationForm =
    this.formBuilder.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
        ],
      ],

      category: [
        'Code Review',
        Validators.required,
      ],

      reviewer: [
        'Samuel Kamande',
        Validators.required,
      ],

      status: [
        'In Review' as
          EvaluationStatus,
        Validators.required,
      ],
    });

  constructor() {
    this.submitRequests
      .pipe(
        exhaustMap(() => {
          const input =
            this.evaluationForm
              .getRawValue();

          this.submitting.set(true);
          this.submitError.set(null);

          this.evaluationForm.disable({
            emitEvent: false,
          });

          return this.evaluationFacade
            .createTask(input)
            .pipe(
              tap((createdTask) => {
                void this.router.navigate([
                  '/tasks',
                  createdTask.id,
                ]);
              }),

              catchError(
                (error: unknown) => {
                  this.submitError.set(
                    this.getErrorMessage(
                      error,
                    ),
                  );

                  return EMPTY;
                },
              ),

              finalize(() => {
                this.evaluationForm.enable({
                  emitEvent: false,
                });

                this.submitting.set(false);
              }),
            );
        }),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe();
  }

  protected submit(): void {
    if (
      this.evaluationForm.invalid ||
      this.submitting()
    ) {
      this.evaluationForm
        .markAllAsTouched();

      return;
    }

    this.submitRequests.next();
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

    return (
      'The evaluation could not be ' +
      'created. Please try again.'
    );
  }
}
