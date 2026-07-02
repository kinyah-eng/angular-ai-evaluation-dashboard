import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EvaluationStatus } from '../../core/evaluation-task';
import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-new-evaluation-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-evaluation.html',
  styleUrls: ['../page.scss', './new-evaluation.scss'],
})
export class NewEvaluationPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskStore = inject(TaskStore);
  private readonly router = inject(Router);

  protected readonly evaluationForm =
    this.formBuilder.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['Code Review', Validators.required],
      reviewer: ['Samuel Kamande', Validators.required],
      status: ['In Review' as EvaluationStatus, Validators.required],
    });

  protected submit(): void {
    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    this.taskStore.addTask(this.evaluationForm.getRawValue());
    void this.router.navigate(['/tasks']);
  }
}
