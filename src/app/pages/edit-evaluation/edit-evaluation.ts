import {
  Component,
  DestroyRef,
  inject,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { EvaluationStatus } from '../../core/evaluation-task';
import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-edit-evaluation-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-evaluation.html',
  styleUrls: ['../page.scss', './edit-evaluation.scss'],
})
export class EditEvaluationPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskStore = inject(TaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected taskId = '';

  protected loading = true;
  protected notFound = false;

  protected readonly evaluationForm =
    this.formBuilder.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['Code Review', Validators.required],
      reviewer: ['', Validators.required],
      status: ['In Review' as EvaluationStatus, Validators.required],
    });

  constructor() {
    const taskId = this.route.snapshot.paramMap.get('id');

    if (!taskId) {
      this.loading = false;
      this.notFound = true;
      return;
    }

    this.taskId = taskId;

    this.taskStore
      .getTask$(taskId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
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
    if (this.evaluationForm.invalid || !this.taskId) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const updated = this.taskStore.updateTask(
      this.taskId,
      this.evaluationForm.getRawValue(),
    );

    if (updated) {
      void this.router.navigate(['/tasks', this.taskId]);
    }
  }
}
