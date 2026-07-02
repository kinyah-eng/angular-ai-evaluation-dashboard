import { TestBed } from '@angular/core/testing';
import {
  firstValueFrom,
  of,
} from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { NotificationService } from '../../core/services/notification.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { EvaluationFacade } from './evaluation.facade';
import { EvaluationTaskStore } from './evaluation-task.store';

describe('EvaluationFacade', () => {
  const tasks: EvaluationTask[] = [
    {
      id: 'EV-2001',
      title:
        'Review an Angular observable workflow',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
      statusKey: 'review',
      qualityScore: 90,
    },
  ];

  const storeMock = {
    tasks$: of(tasks),

    getTask$: vi.fn(
      (id: string) =>
        of(
          tasks.find(
            (task) => task.id === id,
          ),
        ),
    ),

    addTask: vi.fn(),
    updateTask: vi.fn(() => true),
    completeTask: vi.fn(),
    deleteTask: vi.fn(() => true),
  };

  const notificationMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };

  let facade: EvaluationFacade;

  beforeEach(() => {
    vi.clearAllMocks();

    storeMock.updateTask.mockReturnValue(true);
    storeMock.deleteTask.mockReturnValue(true);

    TestBed.configureTestingModule({
      providers: [
        EvaluationFacade,
        {
          provide: EvaluationTaskStore,
          useValue: storeMock,
        },
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
      ],
    });

    facade = TestBed.inject(EvaluationFacade);
  });

  it('exposes tasks from the store', async () => {
    const result =
      await firstValueFrom(facade.tasks$);

    expect(result).toEqual(tasks);
  });

  it('returns one evaluation by identifier', async () => {
    const result = await firstValueFrom(
      facade.getTask$('EV-2001'),
    );

    expect(result?.id).toBe('EV-2001');

    expect(
      storeMock.getTask$,
    ).toHaveBeenCalledWith('EV-2001');
  });

  it('creates an evaluation and shows feedback', () => {
    const input: NewEvaluation = {
      title: 'Inspect an RxJS workflow',
      category: 'Debugging',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    };

    facade.addTask(input);

    expect(
      storeMock.addTask,
    ).toHaveBeenCalledWith(input);

    expect(
      notificationMock.success,
    ).toHaveBeenCalledWith(
      'Evaluation created',
      '"Inspect an RxJS workflow" was added to the workflow.',
    );
  });

  it('updates an evaluation and shows feedback', () => {
    const input: NewEvaluation = {
      title: 'Updated evaluation',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'Completed',
    };

    const updated = facade.updateTask(
      'EV-2001',
      input,
    );

    expect(updated).toBe(true);

    expect(
      notificationMock.success,
    ).toHaveBeenCalledWith(
      'Evaluation updated',
      'EV-2001 was updated successfully.',
    );
  });

  it('shows an error when an update fails', () => {
    storeMock.updateTask.mockReturnValue(false);

    facade.updateTask('EV-9999', {
      title: 'Missing evaluation',
      category: 'Debugging',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    });

    expect(
      notificationMock.error,
    ).toHaveBeenCalledWith(
      'Update failed',
      'EV-9999 could not be found.',
    );
  });

  it('completes an evaluation and shows feedback', () => {
    facade.completeTask('EV-2001');

    expect(
      storeMock.completeTask,
    ).toHaveBeenCalledWith('EV-2001');

    expect(
      notificationMock.success,
    ).toHaveBeenCalledWith(
      'Evaluation completed',
      'EV-2001 was marked as completed.',
    );
  });

  it('deletes an evaluation and shows feedback', () => {
    const deleted =
      facade.deleteTask('EV-2001');

    expect(deleted).toBe(true);

    expect(
      notificationMock.warning,
    ).toHaveBeenCalledWith(
      'Evaluation deleted',
      'EV-2001 was removed from the workflow.',
    );
  });
});
