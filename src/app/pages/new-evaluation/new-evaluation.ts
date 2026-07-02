import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EvaluationStatus } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-new-evaluation-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-evaluation.html',
  styleUrls: ['../page.scss', './new-evaluation.scss'],
})
export class NewEvaluationPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly evaluationFacade = inject(EvaluationFacade);
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

    this.evaluationFacade.addTask(this.evaluationForm.getRawValue());
    void this.router.navigate(['/tasks']);
  }
}
