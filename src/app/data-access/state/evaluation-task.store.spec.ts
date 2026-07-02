import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { EVALUATION_TASK_REPOSITORY } from '../repositories/evaluation-task.repository';
import { EvaluationTaskStore } from './evaluation-task.store';

describe('EvaluationTaskStore', () => {
  let store: EvaluationTaskStore;

  let repositoryMock: {
    load: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repositoryMock = {
      load: vi.fn(() => null),
      save: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        EvaluationTaskStore,
        {
          provide: EVALUATION_TASK_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    });

    store = TestBed.inject(EvaluationTaskStore);
  });

  it('loads the initial evaluation tasks', async () => {
    const tasks = await firstValueFrom(store.tasks$);

    expect(tasks).toHaveLength(4);
    expect(repositoryMock.load).toHaveBeenCalledOnce();
  });

  it('adds a new evaluation task', async () => {
    store.addTask({
      title: 'Test Angular routing behavior',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    });

    const tasks = await firstValueFrom(store.tasks$);

    expect(tasks).toHaveLength(5);

    expect(tasks[0].title).toBe(
      'Test Angular routing behavior',
    );
  });

  it('updates an existing evaluation', async () => {
    const updated = store.updateTask(
      'EV-1042',
      {
        title: 'Updated Angular validation task',
        category: 'Maintainability',
        reviewer: 'Samuel Kamande',
        status: 'Completed',
      },
    );

    const task = await firstValueFrom(
      store.getTask$('EV-1042'),
    );

    expect(updated).toBe(true);

    expect(task?.title).toBe(
      'Updated Angular validation task',
    );

    expect(task?.status).toBe('Completed');
  });

  it('marks an evaluation as complete', async () => {
    store.completeTask('EV-1040');

    const task = await firstValueFrom(
      store.getTask$('EV-1040'),
    );

    expect(task?.status).toBe('Completed');
    expect(task?.statusKey).toBe('completed');
  });

  it('deletes an evaluation task', async () => {
    const deleted = store.deleteTask('EV-1041');

    const tasks = await firstValueFrom(
      store.tasks$,
    );

    expect(deleted).toBe(true);

    expect(
      tasks.some((task) => task.id === 'EV-1041'),
    ).toBe(false);
  });

  it('persists state changes through the repository', () => {
    store.addTask({
      title: 'Evaluate a repository abstraction',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    });

    expect(repositoryMock.save).toHaveBeenCalledOnce();

    expect(repositoryMock.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          title:
            'Evaluate a repository abstraction',
        }),
      ]),
    );
  });
});
