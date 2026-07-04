import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import {
  delay,
  of,
  throwError,
} from 'rxjs';

import { AppConfigService } from '../config/app-config.service';
import {
  EvaluationStatus,
  NewEvaluation,
} from '../../data-access/models/evaluation-task.model';
import { MockEvaluationApiService } from '../../data-access/services/mock-evaluation-api.service';
import { ApiHealthResponse } from './api-health.model';

const MOCK_LATENCY_MILLISECONDS = 150;

export const mockApiInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const config =
      inject(AppConfigService);

    const evaluationApi =
      inject(MockEvaluationApiService);

    const baseUrl =
      config.apiBaseUrl.replace(
        /\/$/,
        '',
      );

    const healthUrl =
      `${baseUrl}/health`;

    const collectionUrl =
      `${baseUrl}/evaluations`;

    if (
      request.method === 'GET' &&
      request.url === healthUrl
    ) {
      const body:
        ApiHealthResponse = {
          status: 'ok',
          service: 'EvalOps API',
          version:
            config.applicationVersion,
          timestamp:
            new Date().toISOString(),
        };

      return delayedResponse(
        new HttpResponse({
          status: 200,
          body,
          url: request.url,
        }),
      );
    }

    if (
      request.method === 'GET' &&
      request.url === collectionUrl
    ) {
      return delayedResponse(
        new HttpResponse({
          status: 200,
          body:
            evaluationApi.list(),
          url: request.url,
        }),
      );
    }

    if (
      request.method === 'POST' &&
      request.url === collectionUrl
    ) {
      if (
        !isNewEvaluation(
          request.body,
        )
      ) {
        return errorResponse(
          request.url,
          400,
          'Bad Request',
          'The evaluation payload is invalid.',
        );
      }

      const createdTask =
        evaluationApi.create(
          request.body,
        );

      return delayedResponse(
        new HttpResponse({
          status: 201,
          body: createdTask,
          url: request.url,
        }),
      );
    }

    const resourceIdentifier =
      getResourceIdentifier(
        request.url,
        collectionUrl,
      );

    if (!resourceIdentifier) {
      return next(request);
    }

    if (request.method === 'GET') {
      const task =
        evaluationApi.getById(
          resourceIdentifier,
        );

      if (!task) {
        return notFoundResponse(
          request.url,
          resourceIdentifier,
        );
      }

      return delayedResponse(
        new HttpResponse({
          status: 200,
          body: task,
          url: request.url,
        }),
      );
    }

    if (request.method === 'PUT') {
      if (
        !isNewEvaluation(
          request.body,
        )
      ) {
        return errorResponse(
          request.url,
          400,
          'Bad Request',
          'The evaluation payload is invalid.',
        );
      }

      const updatedTask =
        evaluationApi.update(
          resourceIdentifier,
          request.body,
        );

      if (!updatedTask) {
        return notFoundResponse(
          request.url,
          resourceIdentifier,
        );
      }

      return delayedResponse(
        new HttpResponse({
          status: 200,
          body: updatedTask,
          url: request.url,
        }),
      );
    }

    if (request.method === 'PATCH') {
      if (
        !isCompletionRequest(
          request.body,
        )
      ) {
        return errorResponse(
          request.url,
          400,
          'Bad Request',
          'Only completion updates are supported.',
        );
      }

      const completedTask =
        evaluationApi.complete(
          resourceIdentifier,
        );

      if (!completedTask) {
        return notFoundResponse(
          request.url,
          resourceIdentifier,
        );
      }

      return delayedResponse(
        new HttpResponse({
          status: 200,
          body: completedTask,
          url: request.url,
        }),
      );
    }

    if (
      request.method === 'DELETE'
    ) {
      const deleted =
        evaluationApi.delete(
          resourceIdentifier,
        );

      if (!deleted) {
        return notFoundResponse(
          request.url,
          resourceIdentifier,
        );
      }

      return delayedResponse(
        new HttpResponse({
          status: 204,
          url: request.url,
        }),
      );
    }

    return next(request);
  };

function delayedResponse<T>(
  response: HttpResponse<T>,
) {
  return of(response).pipe(
    delay(
      MOCK_LATENCY_MILLISECONDS,
    ),
  );
}

function getResourceIdentifier(
  requestUrl: string,
  collectionUrl: string,
): string | null {
  const resourcePrefix =
    `${collectionUrl}/`;

  if (
    !requestUrl.startsWith(
      resourcePrefix,
    )
  ) {
    return null;
  }

  const encodedIdentifier =
    requestUrl.slice(
      resourcePrefix.length,
    );

  if (
    !encodedIdentifier ||
    encodedIdentifier.includes('/')
  ) {
    return null;
  }

  try {
    return decodeURIComponent(
      encodedIdentifier,
    );
  } catch {
    return null;
  }
}

function isNewEvaluation(
  value: unknown,
): value is NewEvaluation {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<NewEvaluation>;

  return (
    isNonEmptyString(
      candidate.title,
    ) &&
    isNonEmptyString(
      candidate.category,
    ) &&
    isNonEmptyString(
      candidate.reviewer,
    ) &&
    isEvaluationStatus(
      candidate.status,
    )
  );
}

function isCompletionRequest(
  value: unknown,
): value is {
  readonly status: 'Completed';
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'Completed'
  );
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

function isEvaluationStatus(
  value: unknown,
): value is EvaluationStatus {
  return (
    value === 'In Review' ||
    value === 'Completed' ||
    value === 'Needs Attention'
  );
}

function notFoundResponse(
  url: string,
  identifier: string,
) {
  return errorResponse(
    url,
    404,
    'Not Found',
    `${identifier} could not be found.`,
  );
}

function errorResponse(
  url: string,
  status: number,
  statusText: string,
  message: string,
) {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText,
        url,
        error: {
          message,
        },
      }),
  );
}
