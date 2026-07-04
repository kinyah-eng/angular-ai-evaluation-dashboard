import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { NotificationService } from '../services/notification.service';
import { ApplicationError } from './application-error';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  const notificationMock = {
    error: vi.fn(),
  };

  let handler: GlobalErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(
      console,
      'error',
    ).mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
      ],
    });

    handler = TestBed.inject(
      GlobalErrorHandler,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports a typed application error', () => {
    handler.handleError(
      new ApplicationError(
        'network_error',
        'Request returned status 503.',
        'The service is temporarily unavailable.',
      ),
    );

    expect(
      notificationMock.error,
    ).toHaveBeenCalledWith(
      'Something went wrong',
      'The service is temporarily unavailable.',
    );

    expect(
      console.error,
    ).toHaveBeenCalled();
  });

  it('uses a safe message for an ordinary Error', () => {
    handler.handleError(
      new Error('Internal implementation detail'),
    );

    expect(
      notificationMock.error,
    ).toHaveBeenCalledWith(
      'Something went wrong',
      'The application encountered an unexpected problem. Please try again.',
    );
  });

  it('unwraps rejected-promise reasons', () => {
    handler.handleError({
      reason: new ApplicationError(
        'persistence_error',
        'Storage failed.',
        'Your changes could not be saved.',
      ),
    });

    expect(
      notificationMock.error,
    ).toHaveBeenCalledWith(
      'Something went wrong',
      'Your changes could not be saved.',
    );
  });
});
