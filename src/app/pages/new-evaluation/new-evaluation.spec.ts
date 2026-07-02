import { FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
} from '@angular/router';
import {
  Subject,
  of,
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
import { NewEvaluationPage } from './new-evaluation';

interface TestInstance {
  readonly evaluationForm: FormGroup;
  readonly submitting: () => boolean;
  readonly submitError: () => string | null;

  submit(): void;
}

describe('NewEvaluationPage', () => {
  const createdTask: EvaluationTask = {
    id: 'EV-1043',
    title: 'Review asynchronous form submission',
    category: 'Code Review',
    reviewer: 'Samuel Kamande',
    status: 'In Review',
    statusKey: 'review',
    qualityScore: 0,
  };

  const facadeMock = {
    createTask: vi.fn(),
  };

  let instance: TestInstance;
  let router: Router;

  beforeEach(() => {
    vi.clearAllMocks();

    facadeMock.createTask.mockReturnValue(
      of(createdTask),
    );

    TestBed.configureTestingModule({
      imports: [
        NewEvaluationPage,
      ],

      providers: [
        provideRouter([]),

        {
          provide: EvaluationFacade,
          useValue: facadeMock,
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
        NewEvaluationPage,
      );

    instance =
      fixture.componentInstance as unknown as TestInstance;

    instance.evaluationForm.setValue({
      title: createdTask.title,
      category: createdTask.category,
      reviewer: createdTask.reviewer,
      status: createdTask.status,
    });
  });

  it('navigates only after creation succeeds', () => {
    instance.submit();

    expect(
      facadeMock.createTask,
    ).toHaveBeenCalledOnce();

    expect(
      router.navigate,
    ).toHaveBeenCalledWith([
      '/tasks',
      'EV-1043',
    ]);

    expect(
      instance.submitting(),
    ).toBe(false);
  });

  it('ignores duplicate submissions while pending', () => {
    const response =
      new Subject<EvaluationTask>();

    facadeMock.createTask.mockReturnValue(
      response,
    );

    instance.submit();
    instance.submit();

    expect(
      facadeMock.createTask,
    ).toHaveBeenCalledOnce();

    expect(
      instance.submitting(),
    ).toBe(true);

    response.next(createdTask);
    response.complete();

    expect(
      instance.submitting(),
    ).toBe(false);
  });

  it('shows API failure feedback without navigating', () => {
    facadeMock.createTask.mockReturnValue(
      throwError(
        () =>
          new ApplicationError(
            'network_error',
            'POST request failed.',
            'The evaluation service is unavailable.',
          ),
      ),
    );

    instance.submit();

    expect(
      instance.submitError(),
    ).toBe(
      'The evaluation service is unavailable.',
    );

    expect(
      router.navigate,
    ).not.toHaveBeenCalled();
  });
});
