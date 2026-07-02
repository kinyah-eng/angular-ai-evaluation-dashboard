import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-reviews-page',
  imports: [AsyncPipe],
  templateUrl: './reviews.html',
  styleUrls: ['../page.scss', './reviews.scss'],
})
export class ReviewsPage {
  private readonly evaluationFacade = inject(EvaluationFacade);

  protected readonly pendingReviews$ = this.evaluationFacade.tasks$.pipe(
    map((tasks) =>
      tasks.filter((task) => task.status !== 'Completed'),
    ),
  );

  protected completeReview(id: string): void {
    this.evaluationFacade.completeTask(id);
  }
}
