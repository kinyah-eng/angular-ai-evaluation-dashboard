import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import {
  catchError,
  throwError,
} from 'rxjs';

import { ApplicationError } from '../errors/application-error';

export const apiErrorInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) =>
    next(request).pipe(
      catchError((error: unknown) => {
        if (
          error instanceof ApplicationError
        ) {
          return throwError(() => error);
        }

        if (
          error instanceof HttpErrorResponse
        ) {
          return throwError(
            () =>
              mapHttpError(
                error,
                request.method,
              ),
          );
        }

        return throwError(
          () =>
            new ApplicationError(
              'unknown_error',
              `Unexpected HTTP failure during ${request.method} ${request.url}.`,
              'The request could not be completed. Please try again.',
              error,
            ),
        );
      }),
    );

function mapHttpError(
  error: HttpErrorResponse,
  method: string,
): ApplicationError {
  const technicalMessage =
    `${method} ${error.url ?? 'unknown URL'} ` +
    `failed with status ${error.status}.`;

  if (error.status === 0) {
    return new ApplicationError(
      'network_error',
      technicalMessage,
      'The service could not be reached. Check your connection and try again.',
      error,
    );
  }

  if (error.status === 400) {
    return new ApplicationError(
      'validation_error',
      technicalMessage,
      'Some submitted information was invalid.',
      error,
    );
  }

  if (
    error.status === 401 ||
    error.status === 403
  ) {
    return new ApplicationError(
      'authorization_error',
      technicalMessage,
      'You are not authorized to perform this operation.',
      error,
    );
  }

  if (error.status === 404) {
    return new ApplicationError(
      'not_found',
      technicalMessage,
      'The requested resource could not be found.',
      error,
    );
  }

  if (error.status >= 500) {
    return new ApplicationError(
      'network_error',
      technicalMessage,
      'The service is temporarily unavailable. Please try again.',
      error,
    );
  }

  return new ApplicationError(
    'unknown_error',
    technicalMessage,
    'The request could not be completed. Please try again.',
    error,
  );
}
