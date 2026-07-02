import {
  HttpClient,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  TestBed,
} from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { AppConfigService } from '../../core/config/app-config.service';
import {
  EvaluationTask,
  NewEvaluation,
} from '../models/evaluation-task.model';
import { HttpEvaluationApiRepository } from './http-evaluation-api.repository';

describe(
  'HttpEvaluationApiRepository',
  () => {
    const task: EvaluationTask = {
      id: 'EV-4001',
      title:
        'Review Angular HTTP architecture',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
      statusKey: 'review',
      qualityScore: 90,
    };

    const input: NewEvaluation = {
      title:
        'Review Angular HTTP architecture',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
    };

    let repository:
      HttpEvaluationApiRepository;

    let controller:
      HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),

          HttpEvaluationApiRepository,

          {
            provide: AppConfigService,
            useValue: {
              apiBaseUrl: '/api',
            },
          },
        ],
      });

      repository = TestBed.inject(
        HttpEvaluationApiRepository,
      );

      controller = TestBed.inject(
        HttpTestingController,
      );
    });

    afterEach(() => {
      controller.verify();
    });

    it('loads all evaluations', () => {
      repository.list().subscribe(
        (tasks) => {
          expect(tasks).toEqual([task]);
        },
      );

      const request =
        controller.expectOne(
          '/api/evaluations',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush([task]);
    });

    it('loads one evaluation', () => {
      repository
        .getById('EV-4001')
        .subscribe((result) => {
          expect(result).toEqual(task);
        });

      const request =
        controller.expectOne(
          '/api/evaluations/EV-4001',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(task);
    });

    it('creates an evaluation', () => {
      repository
        .create(input)
        .subscribe((result) => {
          expect(result).toEqual(task);
        });

      const request =
        controller.expectOne(
          '/api/evaluations',
        );

      expect(
        request.request.method,
      ).toBe('POST');

      expect(
        request.request.body,
      ).toEqual(input);

      request.flush(task);
    });

    it('updates an evaluation', () => {
      repository
        .update('EV-4001', input)
        .subscribe((result) => {
          expect(result).toEqual(task);
        });

      const request =
        controller.expectOne(
          '/api/evaluations/EV-4001',
        );

      expect(
        request.request.method,
      ).toBe('PUT');

      expect(
        request.request.body,
      ).toEqual(input);

      request.flush(task);
    });

    it('marks an evaluation complete', () => {
      const completedTask: EvaluationTask = {
        ...task,
        status: 'Completed',
        statusKey: 'completed',
        qualityScore: 95,
      };

      repository
        .complete('EV-4001')
        .subscribe((result) => {
          expect(result).toEqual(
            completedTask,
          );
        });

      const request =
        controller.expectOne(
          '/api/evaluations/EV-4001',
        );

      expect(
        request.request.method,
      ).toBe('PATCH');

      expect(
        request.request.body,
      ).toEqual({
        status: 'Completed',
      });

      request.flush(completedTask);
    });

    it('deletes an evaluation', () => {
      repository
        .delete('EV-4001')
        .subscribe((result) => {
          expect(result).toBeNull();
        });

      const request =
        controller.expectOne(
          '/api/evaluations/EV-4001',
        );

      expect(
        request.request.method,
      ).toBe('DELETE');

      request.flush(null);
    });
  },
);
