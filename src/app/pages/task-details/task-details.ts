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

import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-task-details-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './task-details.html',
  styleUrls: ['../page.scss', './task-details.scss'],
})
export class TaskDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskStore = inject(TaskStore);

  protected readonly task$ = this.route.paramMap.pipe(
    map((parameters) => parameters.get('id') ?? ''),
    switchMap((id) => this.taskStore.getTask$(id)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected completeTask(id: string): void {
    this.taskStore.completeTask(id);
  }

  protected deleteTask(id: string): void {
    const confirmed = window.confirm(
      'Delete this evaluation permanently?',
    );

    if (!confirmed) {
      return;
    }

    this.taskStore.deleteTask(id);
    void this.router.navigate(['/tasks']);
  }
}
