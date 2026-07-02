import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, shareReplay } from 'rxjs';

import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

interface Metric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly evaluationFacade = inject(EvaluationFacade);

  protected readonly currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  protected readonly recentTasks$ = this.evaluationFacade.tasks$.pipe(
    map((tasks) => tasks.slice(0, 4)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected readonly metrics$ = this.evaluationFacade.tasks$.pipe(
    map((tasks): Metric[] => {
      const completed = tasks.filter(
        (task) => task.status === 'Completed',
      ).length;

      const pending = tasks.filter(
        (task) => task.status !== 'Completed',
      ).length;

      const qualityScores = tasks
        .map((task) => task.qualityScore)
        .filter((score) => score > 0);

      const averageQuality = qualityScores.length
        ? qualityScores.reduce((total, score) => total + score, 0) /
          qualityScores.length
        : 0;

      return [
        {
          label: 'Active Tasks',
          value: String(tasks.length),
          change: 'Live task total',
          positive: true,
        },
        {
          label: 'Average Quality',
          value: `${averageQuality.toFixed(1)}%`,
          change: 'Across scored tasks',
          positive: true,
        },
        {
          label: 'Pending Reviews',
          value: String(pending),
          change: `${pending} require action`,
          positive: false,
        },
        {
          label: 'Tasks Completed',
          value: String(completed),
          change: 'Updated automatically',
          positive: true,
        },
      ];
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
