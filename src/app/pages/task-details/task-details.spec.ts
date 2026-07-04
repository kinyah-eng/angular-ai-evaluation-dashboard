import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
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
import { TaskDetailsPage } from './task-details';

interface TestInstance {
  readonly actionError:
    () => string | null;

  completeTask(id: string): void;
  deleteTask(id: string): void;

  isCompleting(id: string):
    boolean;

  isDeleting(id: string):
    boolean;
}

describe('TaskDetailsPage', () => {
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
    getTask$: vi.fn(),
    finishTask: vi.fn(),
    removeTask: vi.fn(),
  };

  let instance: TestInstance;
  let router: Router;

  beforeEach(() => {
    vi.clearAllMocks();

    facadeMock.getTask$
      .mockReturnValue(of(task));

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

    facadeMock.removeTask
      .mockReturnValue(
        of(undefined),
      );

    TestBed.configureTestingModule({
      imports: [
        TaskDetailsPage,
      ],

      providers: [
        provideRouter([]),

        {
          provide:
            EvaluationFacade,
          useValue: facadeMock,
        },

        {
          provide:
            ActivatedRoute,
          useValue: {
            paramMap: of(
              convertToParamMap({
                id: task.id,
              }),
            ),
          },
        },
      ],
    });

    router = TestBed.inject(Router);

    vi.spyOn(
      router,
      'navigate',
    ).mockResolvedValue(true);

    const fixture =
      TestBed.createComponent(
        TaskDetailsPage,
      );

    instance = fixture.componentInstance as unknown as TestInstance;
  });

  it('ignores duplicate completion actions while pending', () => {
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
      instance.isCompleting(
        task.id,
      ),
    ).toBe(true);

    response.next({
      ...task,
      status: 'Completed',
      statusKey: 'completed',
    });

    response.complete();

    expect(
      instance.isCompleting(
        task.id,
      ),
    ).toBe(false);
  });

  it('navigates only after deletion succeeds', () => {
    const response =
      new Subject<void>();

    facadeMock.removeTask
      .mockReturnValue(response);

    vi.spyOn(
      window,
      'confirm',
    ).mockReturnValue(true);

    instance.deleteTask(task.id);

    expect(
      router.navigate,
    ).not.toHaveBeenCalled();

    expect(
      instance.isDeleting(task.id),
    ).toBe(true);

    response.next(undefined);
    response.complete();

    expect(
      router.navigate,
    ).toHaveBeenCalledWith([
      '/tasks',
    ]);
  });

  it('shows completion failure feedback', () => {
    facadeMock.finishTask
      .mockReturnValue(
        throwError(
          () =>
            new ApplicationError(
              'network_error',
              'PATCH request failed.',
              'The evaluation service is unavailable.',
            ),
        ),
      );

    instance.completeTask(task.id);

    expect(
      instance.actionError(),
    ).toBe(
      'The evaluation service is unavailable.',
    );

    expect(
      router.navigate,
    ).not.toHaveBeenCalled();
  });
});
