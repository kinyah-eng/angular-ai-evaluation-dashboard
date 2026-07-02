import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AppConfigService } from '../../core/config/app-config.service';
import { AppEnvironment } from '../../core/config/app-environment.model';
import { APP_ENVIRONMENT } from '../../core/config/app-environment.token';
import { EvaluationTask } from '../models/evaluation-task.model';
import { LocalStorageEvaluationTaskRepository } from './local-storage-evaluation-task.repository';

describe(
  'LocalStorageEvaluationTaskRepository',
  () => {
    const testEnvironment: AppEnvironment = {
      production: false,
      applicationName: 'EvalOps Test',
      applicationVersion: '1.0.0-test',
      apiBaseUrl: 'http://localhost:4000/api',
      storagePrefix: 'evalops-test',
      features: {
        auditTrail: true,
        advancedAnalytics: false,
        reviewerWorkload: true,
      },
    };

    const tasks: EvaluationTask[] = [
      {
        id: 'EV-3001',
        title: 'Test repository persistence',
        category: 'Code Review',
        reviewer: 'Samuel Kamande',
        status: 'In Review',
        statusKey: 'review',
        qualityScore: 91,
      },
    ];

    let storage: Record<string, string>;

    let repository:
      LocalStorageEvaluationTaskRepository;

    beforeEach(() => {
      storage = {};

      vi.stubGlobal('localStorage', {
        getItem: vi.fn(
          (key: string) =>
            storage[key] ?? null,
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

      TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          LocalStorageEvaluationTaskRepository,
          {
            provide: APP_ENVIRONMENT,
            useValue: testEnvironment,
          },
        ],
      });

      repository = TestBed.inject(
        LocalStorageEvaluationTaskRepository,
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns null when no tasks are stored', () => {
      expect(repository.load()).toBeNull();
    });

    it('saves tasks using the configured prefix', () => {
      repository.save(tasks);

      expect(
        localStorage.setItem,
      ).toHaveBeenCalledWith(
        'evalops-test-evaluation-tasks',
        JSON.stringify(tasks),
      );
    });

    it('loads valid stored evaluation tasks', () => {
      storage[
        'evalops-test-evaluation-tasks'
      ] = JSON.stringify(tasks);

      expect(repository.load()).toEqual(tasks);
    });

    it('returns null for invalid stored JSON', () => {
      storage[
        'evalops-test-evaluation-tasks'
      ] = '{invalid-json';

      expect(repository.load()).toBeNull();
    });

    it('clears the stored task collection', () => {
      storage[
        'evalops-test-evaluation-tasks'
      ] = JSON.stringify(tasks);

      repository.clear();

      expect(
        localStorage.removeItem,
      ).toHaveBeenCalledWith(
        'evalops-test-evaluation-tasks',
      );
    });
  },
);
