import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
} from '@angular/router';
import {
  of,
  Subject,
  throwError,
} from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ApplicationError } from '../../core/errors/application-error';
import { EvaluationTask } from '../../data-access/models/evaluation-task.model';
import { EvaluationFacade } from '../../data-access/state/evaluation.facade';
import { TasksPage } from './tasks';

interface TestInstance {
  completeTask(id: string): void;

  isCompleting(id: string):
    boolean;

  hasPendingCompletion():
    boolean;

  completionError(
    id: string,
  ): string | undefined;
}

describe('TasksPage', () => {
  const task: EvaluationTask = {
    id: 'EV-1042',
    title:
      'Angular reactive form validation',
    category: 'Code Review',
    reviewer: 'Samuel Kamande',
    status: 'In Review',
    statusKey: 'review',
    qualityScore: 92,
  };

  const facadeMock = {
    tasks$: of([task]),
    finishTask: vi.fn(),
  };

  let instance: TestInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    facadeMock.finishTask
      .mockReturnValue(
        of({
          ...task,
          status:
            'Completed' as const,
          statusKey:
            'completed' as const,
        }),
      );

    TestBed.configureTestingModule({
      imports: [TasksPage],

      providers: [
        provideRouter([]),

        {
          provide:
            EvaluationFacade,
          useValue: facadeMock,
        },
      ],
    });

    const fixture =
      TestBed.createComponent(
        TasksPage,
      );

    instance = fixture.componentInstance as unknown as TestInstance;
  });

  it('completes a task successfully', () => {
    instance.completeTask(task.id);

    expect(
      facadeMock.finishTask,
    ).toHaveBeenCalledWith(
      task.id,
    );

    expect(
      instance.completionError(
        task.id,
      ),
    ).toBeUndefined();
  });

  it('ignores duplicate completion clicks', () => {
    const response =
      new Subject<
        EvaluationTask
      >();

    facadeMock.finishTask
      .mockReturnValue(response);

    instance.completeTask(task.id);
    instance.completeTask(task.id);

    expect(
      facadeMock.finishTask,
    ).toHaveBeenCalledOnce();

    expect(
      instance.hasPendingCompletion(),
    ).toBe(true);

    response.next({
      ...task,
      status: 'Completed',
      statusKey: 'completed',
    });

    response.complete();

    expect(
      instance.hasPendingCompletion(),
    ).toBe(false);
  });

  it('records completion failure feedback', () => {
    facadeMock.finishTask
      .mockReturnValue(
        throwError(
          () =>
            new ApplicationError(
              'network_error',
              'PATCH request failed.',
              'The task could not be completed.',
            ),
        ),
      );

    instance.completeTask(task.id);

    expect(
      instance.completionError(
        task.id,
      ),
    ).toBe(
      'The task could not be completed.',
    );

    expect(
      instance.isCompleting(task.id),
    ).toBe(false);
  });
});
