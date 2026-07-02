import {
  FormGroup,
} from '@angular/forms';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
} from '@angular/router';
import {
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
import { EditEvaluationPage } from './edit-evaluation';

interface TestInstance {
  readonly evaluationForm:
    FormGroup;

  readonly submitting:
    () => boolean;

  readonly submitError:
    () => string | null;

  readonly loading: boolean;
  readonly notFound: boolean;

  submit(): void;
}

describe(
  'EditEvaluationPage',
  () => {
    const task:
      EvaluationTask = {
        id: 'EV-1042',
        title:
          'Angular reactive form validation',
        category: 'Code Review',
        reviewer:
          'Samuel Kamande',
        status: 'In Review',
        statusKey: 'review',
        qualityScore: 92,
      };

    const updatedTask:
      EvaluationTask = {
        ...task,
        title:
          'Updated Angular form validation',
      };

    const facadeMock = {
      getTask$: vi.fn(),
      saveTask: vi.fn(),
    };

    const routerMock = {
      navigate: vi.fn(
        () =>
          Promise.resolve(true),
      ),
    };

    let instance:
      TestInstance;

    beforeEach(() => {
      vi.clearAllMocks();

      facadeMock.getTask$
        .mockReturnValue(of(task));

      facadeMock.saveTask
        .mockReturnValue(
          of(updatedTask),
        );

      TestBed.configureTestingModule({
        imports: [
          EditEvaluationPage,
        ],

        providers: [
          {
            provide:
              EvaluationFacade,
            useValue: facadeMock,
          },

          {
            provide: Router,
            useValue: routerMock,
          },

          {
            provide:
              ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap:
                  convertToParamMap({
                    id: 'EV-1042',
                  }),
              },
            },
          },
        ],
      });

      const fixture =
        TestBed.createComponent(
          EditEvaluationPage,
        );

      instance = fixture.componentInstance as unknown as TestInstance;
    });

    it('loads the existing evaluation', () => {
      expect(
        facadeMock.getTask$,
      ).toHaveBeenCalledWith(
        'EV-1042',
      );

      expect(
        instance.evaluationForm
          .getRawValue().title,
      ).toBe(task.title);

      expect(instance.loading)
        .toBe(false);

      expect(instance.notFound)
        .toBe(false);
    });

    it('navigates after the update succeeds', () => {
      instance.evaluationForm.patchValue({
        title:
          updatedTask.title,
      });

      instance.submit();

      expect(
        facadeMock.saveTask,
      ).toHaveBeenCalled();

      expect(
        routerMock.navigate,
      ).toHaveBeenCalledWith([
        '/tasks',
        'EV-1042',
      ]);

      expect(
        instance.submitting(),
      ).toBe(false);
    });

    it('shows API failure feedback without navigating', () => {
      facadeMock.saveTask
        .mockReturnValue(
          throwError(
            () =>
              new ApplicationError(
                'network_error',
                'PUT request failed.',
                'The evaluation could not be saved.',
              ),
          ),
        );

      instance.submit();

      expect(
        instance.submitError(),
      ).toBe(
        'The evaluation could not be saved.',
      );

      expect(
        routerMock.navigate,
      ).not.toHaveBeenCalled();
    });
  },
);
