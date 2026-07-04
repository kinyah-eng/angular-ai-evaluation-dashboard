import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  TestBed,
} from '@angular/core/testing';
import {
  firstValueFrom,
} from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  AppConfigService,
} from '../config/app-config.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../../data-access/models/evaluation-task.model';
import {
  MockEvaluationApiService,
} from '../../data-access/services/mock-evaluation-api.service';
import {
  ApiHealthResponse,
} from './api-health.model';
import {
  mockApiInterceptor,
} from './mock-api.interceptor';

describe(
  'mockApiInterceptor',
  () => {
    let http: HttpClient;

    let mockApi:
      MockEvaluationApiService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              mockApiInterceptor,
            ]),
          ),

          MockEvaluationApiService,

          {
            provide:
              AppConfigService,
            useValue: {
              apiBaseUrl: '/api',
              applicationVersion:
                '1.0.0-test',
            },
          },
        ],
      });

      http =
        TestBed.inject(HttpClient);

      mockApi = TestBed.inject(
        MockEvaluationApiService,
      );

      mockApi.reset();
    });

    it('returns API health information', async () => {
      const response =
        await firstValueFrom(
          http.get<ApiHealthResponse>(
            '/api/health',
          ),
        );

      expect(response).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'EvalOps API',
          version: '1.0.0-test',
        }),
      );
    });

    it('lists all evaluations', async () => {
      const tasks =
        await firstValueFrom(
          http.get<
            readonly EvaluationTask[]
          >('/api/evaluations'),
        );

      expect(tasks).toHaveLength(4);

      expect(tasks[0].id).toBe(
        'EV-1042',
      );
    });

    it('loads one evaluation', async () => {
      const task =
        await firstValueFrom(
          http.get<EvaluationTask>(
            '/api/evaluations/EV-1041',
          ),
        );

      expect(task.title).toBe(
        'RxJS subscription leak analysis',
      );
    });

    it('creates an evaluation', async () => {
      const input:
        NewEvaluation = {
          title:
            'Review Angular HTTP interceptors',
          category: 'Code Review',
          reviewer:
            'Samuel Kamande',
          status: 'In Review',
        };

      const createdTask =
        await firstValueFrom(
          http.post<EvaluationTask>(
            '/api/evaluations',
            input,
          ),
        );

      expect(createdTask).toEqual(
        expect.objectContaining({
          id: 'EV-1043',
          title:
            'Review Angular HTTP interceptors',
          statusKey: 'review',
        }),
      );

      expect(
        mockApi.list(),
      ).toHaveLength(5);
    });

    it('updates an evaluation', async () => {
      const input:
        NewEvaluation = {
          title:
            'Updated Angular HTTP review',
          category:
            'Maintainability',
          reviewer:
            'Samuel Kamande',
          status:
            'Needs Attention',
        };

      const updatedTask =
        await firstValueFrom(
          http.put<EvaluationTask>(
            '/api/evaluations/EV-1042',
            input,
          ),
        );

      expect(updatedTask).toEqual(
        expect.objectContaining({
          id: 'EV-1042',
          title:
            'Updated Angular HTTP review',
          status:
            'Needs Attention',
          statusKey:
            'attention',
        }),
      );
    });

    it('marks an evaluation complete', async () => {
      const completedTask =
        await firstValueFrom(
          http.patch<EvaluationTask>(
            '/api/evaluations/EV-1040',
            {
              status: 'Completed',
            },
          ),
        );

      expect(
        completedTask.status,
      ).toBe('Completed');

      expect(
        completedTask.statusKey,
      ).toBe('completed');
    });

    it('deletes an evaluation', async () => {
      await firstValueFrom(
        http.delete(
          '/api/evaluations/EV-1040',
        ),
      );

      expect(
        mockApi.getById(
          'EV-1040',
        ),
      ).toBeUndefined();
    });

    it('returns 404 for a missing evaluation', async () => {
      const request =
        firstValueFrom(
          http.get<EvaluationTask>(
            '/api/evaluations/EV-9999',
          ),
        );

      await expect(
        request,
      ).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('rejects an invalid create payload', async () => {
      const request =
        firstValueFrom(
          http.post(
            '/api/evaluations',
            {
              title: '',
            },
          ),
        );

      await expect(
        request,
      ).rejects.toMatchObject({
        status: 400,
        statusText: 'Bad Request',
      });
    });
  },
);
