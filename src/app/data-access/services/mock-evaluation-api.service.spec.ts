import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  MockEvaluationApiService,
} from './mock-evaluation-api.service';

describe(
  'MockEvaluationApiService',
  () => {
    let service:
      MockEvaluationApiService;

    beforeEach(() => {
      service =
        new MockEvaluationApiService();
    });

    it('starts with seed evaluations', () => {
      expect(
        service.list(),
      ).toHaveLength(4);
    });

    it('returns defensive copies', () => {
      const tasks =
        service.list();

      const firstTask =
        tasks[0];

      const secondRead =
        service.getById(
          firstTask.id,
        );

      expect(secondRead).not.toBe(
        firstTask,
      );

      expect(secondRead).toEqual(
        firstTask,
      );
    });

    it('generates sequential identifiers', () => {
      const created =
        service.create({
          title:
            'Test identifier generation',
          category: 'Code Review',
          reviewer:
            'Samuel Kamande',
          status: 'In Review',
        });

      expect(created.id).toBe(
        'EV-1043',
      );
    });

    it('returns false when deleting a missing task', () => {
      expect(
        service.delete(
          'EV-9999',
        ),
      ).toBe(false);
    });

    it('restores seed data during reset', () => {
      service.delete('EV-1042');

      expect(
        service.list(),
      ).toHaveLength(3);

      service.reset();

      expect(
        service.list(),
      ).toHaveLength(4);
    });
  },
);
