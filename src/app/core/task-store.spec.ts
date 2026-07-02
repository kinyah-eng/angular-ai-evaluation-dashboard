import { firstValueFrom } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { TaskStore } from './task-store';

describe('TaskStore', () => {
  let store: TaskStore;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(
        (key: string) => storage[key] ?? null,
      ),
      setItem: vi.fn(
        (key: string, value: string) => {
          storage[key] = value;
        },
      ),
      removeItem: vi.fn(
        (key: string) => {
          delete storage[key];
        },
      ),
      clear: vi.fn(() => {
        storage = {};
      }),
    });

    store = new TaskStore();
  });

  it('loads the initial evaluation tasks', async () => {
    const tasks = await firstValueFrom(store.tasks$);

    expect(tasks).toHaveLength(4);
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

  it('updates an existing task', async () => {
    const updated = store.updateTask('EV-1042', {
      title: 'Updated Angular validation task',
      category: 'Maintainability',
      reviewer: 'Samuel Kamande',
      status: 'Completed',
    });

    const task = await firstValueFrom(
      store.getTask$('EV-1042'),
    );

    expect(updated).toBe(true);
    expect(task?.title).toBe(
      'Updated Angular validation task',
    );
    expect(task?.status).toBe('Completed');
  });

  it('marks a task as complete', async () => {
    store.completeTask('EV-1040');

    const task = await firstValueFrom(
      store.getTask$('EV-1040'),
    );

    expect(task?.status).toBe('Completed');
    expect(task?.statusKey).toBe('completed');
  });

  it('deletes an evaluation task', async () => {
    const deleted = store.deleteTask('EV-1041');
    const tasks = await firstValueFrom(store.tasks$);

    expect(deleted).toBe(true);
    expect(tasks.some((task) => task.id === 'EV-1041')).toBe(false);
  });
});
