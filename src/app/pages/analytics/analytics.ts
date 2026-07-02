import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-analytics-page',
  imports: [AsyncPipe],
  templateUrl: './analytics.html',
  styleUrls: ['../page.scss', './analytics.scss'],
})
export class AnalyticsPage {
  private readonly evaluationFacade = inject(EvaluationFacade);

  protected readonly analytics$ = this.evaluationFacade.tasks$.pipe(
    map((tasks) => {
      const completed = tasks.filter(
        (task) => task.status === 'Completed',
      ).length;

      const attention = tasks.filter(
        (task) => task.status === 'Needs Attention',
      ).length;

      const scored = tasks.filter((task) => task.qualityScore > 0);

      const average = scored.length
        ? scored.reduce(
            (total, task) => total + task.qualityScore,
            0,
          ) / scored.length
        : 0;

      return {
        total: tasks.length,
        completed,
        attention,
        completionRate: tasks.length
          ? (completed / tasks.length) * 100
          : 0,
        average,
      };
    }),
  );
}
