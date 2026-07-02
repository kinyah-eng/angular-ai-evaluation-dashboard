import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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
      title: 'Review an Angular observable workflow',
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
        of(tasks.find((task) => task.id === id)),
    ),
    addTask: vi.fn(),
    updateTask: vi.fn(() => true),
    completeTask: vi.fn(),
    deleteTask: vi.fn(() => true),
  };

  let facade: EvaluationFacade;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        EvaluationFacade,
        {
          provide: EvaluationTaskStore,
          useValue: storeMock,
        },
      ],
    });

    facade = TestBed.inject(EvaluationFacade);
  });

  it('exposes tasks from the store', async () => {
    const result = await firstValueFrom(facade.tasks$);

    expect(result).toEqual(tasks);
  });

  it('returns one evaluation by identifier', async () => {
    const result = await firstValueFrom(
      facade.getTask$('EV-2001'),
    );

    expect(result?.id).toBe('EV-2001');
    expect(storeMock.getTask$).toHaveBeenCalledWith(
      'EV-2001',
    );
  });

  it('delegates task creation to the store', () => {
    const input: NewEvaluation = {
      title: 'Inspect an RxJS workflow',
      category: 'Debugging',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    };

    facade.addTask(input);

    expect(storeMock.addTask).toHaveBeenCalledWith(input);
  });

  it('delegates task deletion to the store', () => {
    const deleted = facade.deleteTask('EV-2001');

    expect(deleted).toBe(true);
    expect(storeMock.deleteTask).toHaveBeenCalledWith(
      'EV-2001',
    );
  });
});
