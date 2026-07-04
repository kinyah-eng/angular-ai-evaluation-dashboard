import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a success notification', () => {
    service.success(
      'Saved',
      'The evaluation was saved.',
      0,
    );

    expect(
      service.notifications(),
    ).toHaveLength(1);

    expect(
      service.notifications()[0],
    ).toEqual(
      expect.objectContaining({
        level: 'success',
        title: 'Saved',
        message:
          'The evaluation was saved.',
      }),
    );
  });

  it('adds an error notification', () => {
    service.error(
      'Failed',
      'The operation could not be completed.',
    );

    expect(
      service.notifications()[0].level,
    ).toBe('error');
  });

  it('dismisses one notification', () => {
    const identifier = service.info(
      'Information',
      'A new update is available.',
      0,
    );

    service.dismiss(identifier);

    expect(
      service.notifications(),
    ).toHaveLength(0);
  });

  it('clears all notifications', () => {
    service.success('One', 'First', 0);
    service.warning('Two', 'Second', 0);

    service.clear();

    expect(
      service.notifications(),
    ).toEqual([]);
  });

  it('automatically dismisses timed notifications', () => {
    vi.useFakeTimers();

    service.success(
      'Saved',
      'The evaluation was saved.',
      1000,
    );

    expect(
      service.notifications(),
    ).toHaveLength(1);

    vi.advanceTimersByTime(1000);

    expect(
      service.notifications(),
    ).toHaveLength(0);
  });
});
