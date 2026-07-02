import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import {
  map,
  shareReplay,
  switchMap,
} from 'rxjs';

import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-task-details-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './task-details.html',
  styleUrls: ['../page.scss', './task-details.scss'],
})
export class TaskDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluationFacade = inject(EvaluationFacade);

  protected readonly task$ = this.route.paramMap.pipe(
    map((parameters) => parameters.get('id') ?? ''),
    switchMap((id) => this.evaluationFacade.getTask$(id)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected completeTask(id: string): void {
    this.evaluationFacade.completeTask(id);
  }

  protected deleteTask(id: string): void {
    const confirmed = window.confirm(
      'Delete this evaluation permanently?',
    );

    if (!confirmed) {
      return;
    }

    this.evaluationFacade.deleteTask(id);
    void this.router.navigate(['/tasks']);
  }
}
