import { TestBed } from '@angular/core/testing';
import {
  firstValueFrom,
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
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EVALUATION_API_REPOSITORY } from '../repositories/evaluation-api.repository';
import { EvaluationTaskStore } from './evaluation-task.store';

describe(
  'EvaluationTaskStore',
  () => {
    const seedTasks:
      EvaluationTask[] = [
        {
          id: 'EV-1042',
          title:
            'Angular reactive form validation',
          category: 'Code Review',
          reviewer:
            'Samuel Kamande',
          status: 'In Review',
          statusKey: 'review',
          qualityScore: 92,
        },
        {
          id: 'EV-1041',
          title:
            'RxJS subscription leak analysis',
          category: 'Debugging',
          reviewer: 'Amina Noor',
          status: 'Completed',
          statusKey: 'completed',
          qualityScore: 98,
        },
      ];

    const input:
      NewEvaluation = {
        title:
          'Review HTTP state management',
        category: 'Code Review',
        reviewer:
          'Samuel Kamande',
        status: 'In Review',
      };

    let apiMock: {
      list: ReturnType<typeof vi.fn>;
      getById:
        ReturnType<typeof vi.fn>;
      create:
        ReturnType<typeof vi.fn>;
      update:
        ReturnType<typeof vi.fn>;
      complete:
        ReturnType<typeof vi.fn>;
      delete:
        ReturnType<typeof vi.fn>;
    };

    let store:
      EvaluationTaskStore;

    beforeEach(() => {
      apiMock = {
        list: vi.fn(
          () => of(seedTasks),
        ),

        getById: vi.fn(),

        create: vi.fn(),

        update: vi.fn(),

        complete: vi.fn(),

        delete: vi.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          EvaluationTaskStore,

          {
            provide:
              EVALUATION_API_REPOSITORY,
            useValue: apiMock,
          },
        ],
      });

      store = TestBed.inject(
        EvaluationTaskStore,
      );
    });

    it('loads evaluations from the API', async () => {
      const tasks =
        await firstValueFrom(
          store.tasks$,
        );

      expect(tasks).toEqual(
        seedTasks,
      );

      expect(
        apiMock.list,
      ).toHaveBeenCalledOnce();
    });

    it('reports a ready load state', async () => {
      const loading =
        await firstValueFrom(
          store.loading$,
        );

      expect(loading).toBe(false);
    });

    it('creates and prepends an evaluation', async () => {
      const createdTask:
        EvaluationTask = {
          id: 'EV-1043',
          ...input,
          statusKey: 'review',
          qualityScore: 0,
        };

      apiMock.create
        .mockReturnValue(
          of(createdTask),
        );

      const result =
        await firstValueFrom(
          store.addTask(input),
        );

      const tasks =
        await firstValueFrom(
          store.tasks$,
        );

      expect(result).toEqual(
        createdTask,
      );

      expect(tasks[0]).toEqual(
        createdTask,
      );
    });

    it('updates an evaluation', async () => {
      const updatedTask:
        EvaluationTask = {
          ...seedTasks[0],
          title:
            'Updated Angular evaluation',
          status: 'Completed',
          statusKey: 'completed',
        };

      apiMock.update
        .mockReturnValue(
          of(updatedTask),
        );

      await firstValueFrom(
        store.updateTask(
          'EV-1042',
          {
            title:
              updatedTask.title,
            category:
              updatedTask.category,
            reviewer:
              updatedTask.reviewer,
            status:
              updatedTask.status,
          },
        ),
      );

      const task =
        await firstValueFrom(
          store.getTask$(
            'EV-1042',
          ),
        );

      expect(task).toEqual(
        updatedTask,
      );
    });

    it('marks an evaluation complete', async () => {
      const completedTask:
        EvaluationTask = {
          ...seedTasks[0],
          status: 'Completed',
          statusKey: 'completed',
          qualityScore: 95,
        };

      apiMock.complete
        .mockReturnValue(
          of(completedTask),
        );

      await firstValueFrom(
        store.completeTask(
          'EV-1042',
        ),
      );

      const task =
        await firstValueFrom(
          store.getTask$(
            'EV-1042',
          ),
        );

      expect(task?.status).toBe(
        'Completed',
      );
    });

    it('deletes an evaluation', async () => {
      apiMock.delete
        .mockReturnValue(
          of(undefined),
        );

      await firstValueFrom(
        store.deleteTask(
          'EV-1042',
        ),
      );

      const tasks =
        await firstValueFrom(
          store.tasks$,
        );

      expect(
        tasks.some(
          (task) =>
            task.id === 'EV-1042',
        ),
      ).toBe(false);
    });

    it('tracks API mutation errors', async () => {
      apiMock.create
        .mockReturnValue(
          throwError(
            () =>
              new ApplicationError(
                'network_error',
                'API request failed.',
                'The API is unavailable.',
              ),
          ),
        );

      await expect(
        firstValueFrom(
          store.addTask(input),
        ),
      ).rejects.toBeInstanceOf(
        ApplicationError,
      );

      const error =
        await firstValueFrom(
          store.error$,
        );

      expect(error).toBe(
        'The API is unavailable.',
      );
    });
  },
);
