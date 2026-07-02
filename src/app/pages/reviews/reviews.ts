import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-reviews-page',
  imports: [AsyncPipe],
  templateUrl: './reviews.html',
  styleUrls: ['../page.scss', './reviews.scss'],
})
export class ReviewsPage {
  private readonly taskStore = inject(TaskStore);

  protected readonly pendingReviews$ = this.taskStore.tasks$.pipe(
    map((tasks) =>
      tasks.filter((task) => task.status !== 'Completed'),
    ),
  );

  protected completeReview(id: string): void {
    this.taskStore.completeTask(id);
  }
}
