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
  ActivatedRoute,
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
  take,
  tap,
} from 'rxjs';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationStatus } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-edit-evaluation-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl:
    './edit-evaluation.html',
  styleUrls: [
    '../page.scss',
    './edit-evaluation.scss',
  ],
})
export class EditEvaluationPage {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly evaluationFacade =
    inject(EvaluationFacade);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly saveRequests =
    new Subject<void>();

  protected taskId = '';

  protected loading = true;

  protected notFound = false;

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
        '',
        Validators.required,
      ],

      status: [
        'In Review' as
          EvaluationStatus,
        Validators.required,
      ],
    });

  constructor() {
    this.configureSubmission();

    const taskId =
      this.route.snapshot
        .paramMap.get('id');

    if (!taskId) {
      this.loading = false;
      this.notFound = true;
      return;
    }

    this.taskId = taskId;

    this.evaluationFacade
      .getTask$(taskId)
      .pipe(
        take(1),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe((task) => {
        this.loading = false;

        if (!task) {
          this.notFound = true;
          return;
        }

        this.evaluationForm.setValue({
          title: task.title,
          category: task.category,
          reviewer: task.reviewer,
          status: task.status,
        });
      });
  }

  protected submit(): void {
    if (
      this.evaluationForm.invalid ||
      !this.taskId ||
      this.submitting()
    ) {
      this.evaluationForm
        .markAllAsTouched();

      return;
    }

    this.saveRequests.next();
  }

  private configureSubmission(): void {
    this.saveRequests
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
            .saveTask(
              this.taskId,
              input,
            )
            .pipe(
              tap((updatedTask) => {
                void this.router.navigate([
                  '/tasks',
                  updatedTask.id,
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
      'updated. Please try again.'
    );
  }
}
