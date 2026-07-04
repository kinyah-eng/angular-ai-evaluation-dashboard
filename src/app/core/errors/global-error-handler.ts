import {
  ErrorHandler,
  inject,
  Injectable,
} from '@angular/core';

import { NotificationService } from '../services/notification.service';
import { ApplicationError } from './application-error';

interface NormalizedError {
  readonly technicalMessage: string;
  readonly userMessage: string;
}

@Injectable()
export class GlobalErrorHandler
  implements ErrorHandler
{
  private readonly notifications =
    inject(NotificationService);

  handleError(error: unknown): void {
    const normalizedError =
      this.normalizeError(error);

    console.error(
      '[EvalOps] Unhandled application error:',
      error,
    );

    this.notifications.error(
      'Something went wrong',
      normalizedError.userMessage,
    );
  }

  private normalizeError(
    error: unknown,
  ): NormalizedError {
    if (error instanceof ApplicationError) {
      return {
        technicalMessage: error.message,
        userMessage: error.userMessage,
      };
    }

    if (error instanceof Error) {
      return {
        technicalMessage: error.message,
        userMessage:
          'The application encountered an unexpected problem. Please try again.',
      };
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'reason' in error
    ) {
      return this.normalizeError(
        (error as { reason: unknown }).reason,
      );
    }

    if (typeof error === 'string') {
      return {
        technicalMessage: error,
        userMessage:
          'The application encountered an unexpected problem. Please try again.',
      };
    }

    return {
      technicalMessage:
        'Unknown application error',
      userMessage:
        'An unexpected error occurred. Please try again.',
    };
  }
}
