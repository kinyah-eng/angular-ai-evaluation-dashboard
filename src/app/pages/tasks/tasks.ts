import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
} from 'rxjs';

import { EvaluationStatus } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';

@Component({
  selector: 'app-tasks-page',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './tasks.html',
  styleUrls: ['../page.scss', './tasks.scss'],
})
export class TasksPage {
  private readonly evaluationFacade = inject(EvaluationFacade);

  protected readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  protected readonly statusControl = new FormControl<
    EvaluationStatus | 'All'
  >('All', {
    nonNullable: true,
  });

  protected readonly filteredTasks$ = combineLatest([
    this.evaluationFacade.tasks$,
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(250),
      distinctUntilChanged(),
    ),
    this.statusControl.valueChanges.pipe(
      startWith(this.statusControl.value),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([tasks, searchTerm, selectedStatus]) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();

      return tasks.filter((task) => {
        const matchesSearch =
          !normalizedSearch ||
          task.title.toLowerCase().includes(normalizedSearch) ||
          task.category.toLowerCase().includes(normalizedSearch) ||
          task.reviewer.toLowerCase().includes(normalizedSearch) ||
          task.id.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          selectedStatus === 'All' ||
          task.status === selectedStatus;

        return matchesSearch && matchesStatus;
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected completeTask(id: string): void {
    this.evaluationFacade.completeTask(id);
  }
}
