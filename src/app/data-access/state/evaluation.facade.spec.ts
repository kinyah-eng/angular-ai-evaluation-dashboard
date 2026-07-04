import { TestBed } from '@angular/core/testing';
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
import { NotificationService } from '../../core/services/notification.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EvaluationFacade } from './evaluation.facade';
import { EvaluationTaskStore } from './evaluation-task.store';

describe(
  'EvaluationFacade',
  () => {
    const task:
      EvaluationTask = {
        id: 'EV-2001',
        title:
          'Review an Angular observable workflow',
        category: 'Code Review',
        reviewer:
          'Samuel Kamande',
        status: 'In Review',
        statusKey: 'review',
        qualityScore: 90,
      };

    const input:
      NewEvaluation = {
        title:
          'Inspect an RxJS workflow',
        category: 'Debugging',
        reviewer:
          'Samuel Kamande',
        status: 'In Review',
      };

    const storeMock = {
      tasks$: of([task]),
      loading$: of(false),
      error$: of(null),
      pendingOperations$: of([]),

      getTask$: vi.fn(
        () => of(task),
      ),

      hasTask: vi.fn(
        () => true,
      ),

      reload: vi.fn(),
      clearError: vi.fn(),

      addTask: vi.fn(
        () => of(task),
      ),

      updateTask: vi.fn(
        () => of(task),
      ),

      completeTask: vi.fn(
        () =>
          of({
            ...task,
            status:
              'Completed' as const,
            statusKey:
              'completed' as const,
          }),
      ),

      deleteTask: vi.fn(
        () => of(undefined),
      ),
    };

    const notificationMock = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    let facade:
      EvaluationFacade;

    beforeEach(() => {
      vi.clearAllMocks();

      storeMock.hasTask
        .mockReturnValue(true);

      storeMock.addTask
        .mockReturnValue(of(task));

      storeMock.updateTask
        .mockReturnValue(of(task));

      storeMock.completeTask
        .mockReturnValue(
          of({
            ...task,
            status:
              'Completed' as const,
            statusKey:
              'completed' as const,
          }),
        );

      storeMock.deleteTask
        .mockReturnValue(
          of(undefined),
        );

      TestBed.configureTestingModule({
        providers: [
          EvaluationFacade,

          {
            provide:
              EvaluationTaskStore,
            useValue: storeMock,
          },

          {
            provide:
              NotificationService,
            useValue:
              notificationMock,
          },
        ],
      });

      facade = TestBed.inject(
        EvaluationFacade,
      );
    });

    it('exposes store streams', () => {
      expect(facade.tasks$)
        .toBe(storeMock.tasks$);

      expect(facade.loading$)
        .toBe(storeMock.loading$);

      expect(facade.error$)
        .toBe(storeMock.error$);
    });

    it('creates an evaluation', () => {
      facade.addTask(input);

      expect(
        storeMock.addTask,
      ).toHaveBeenCalledWith(input);

      expect(
        notificationMock.success,
      ).toHaveBeenCalled();
    });

    it('updates an existing evaluation', () => {
      const result =
        facade.updateTask(
          'EV-2001',
          input,
        );

      expect(result).toBe(true);

      expect(
        storeMock.updateTask,
      ).toHaveBeenCalledWith(
        'EV-2001',
        input,
      );
    });

    it('rejects an update for a missing evaluation', () => {
      storeMock.hasTask
        .mockReturnValue(false);

      const result =
        facade.updateTask(
          'EV-9999',
          input,
        );

      expect(result).toBe(false);

      expect(
        storeMock.updateTask,
      ).not.toHaveBeenCalled();
    });

    it('completes an evaluation', () => {
      facade.completeTask(
        'EV-2001',
      );

      expect(
        storeMock.completeTask,
      ).toHaveBeenCalledWith(
        'EV-2001',
      );
    });

    it('deletes an evaluation', () => {
      const result =
        facade.deleteTask(
          'EV-2001',
        );

      expect(result).toBe(true);

      expect(
        storeMock.deleteTask,
      ).toHaveBeenCalledWith(
        'EV-2001',
      );
    });

    it('shows an error after an API failure', () => {
      storeMock.addTask
        .mockReturnValue(
          throwError(
            () =>
              new ApplicationError(
                'network_error',
                'Request failed.',
                'The evaluation could not be created.',
              ),
          ),
        );

      facade.addTask(input);

      expect(
        notificationMock.error,
      ).toHaveBeenCalledWith(
        'Creation failed',
        'The evaluation could not be created.',
      );
    });

    it('reloads the store', () => {
      facade.reload();

      expect(
        storeMock.reload,
      ).toHaveBeenCalledOnce();
    });
  },
);
