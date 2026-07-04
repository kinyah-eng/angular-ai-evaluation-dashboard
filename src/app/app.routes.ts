import { Routes } from '@angular/router';

import { UserRole } from './core/auth/auth.model';
import {
  authChildGuard,
  authGuard,
} from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const REVIEW_ROLES:
  readonly UserRole[] = [
    'admin',
    'reviewer',
  ];

const ADMIN_ROLES:
  readonly UserRole[] = [
    'admin',
  ];

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign In | EvalOps',
    loadComponent: () =>
      import('./pages/login/login').then(
        (component) => component.LoginPage,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./layout/layout').then(
        (component) => component.Layout,
      ),
    children: [
      {
        path: '',
        title: 'Dashboard | EvalOps',
        loadComponent: () =>
          import(
            './pages/dashboard/dashboard'
          ).then(
            (component) =>
              component.Dashboard,
          ),
      },
      {
        path: 'tasks/new',
        title: 'New Evaluation | EvalOps',
        loadComponent: () =>
          import(
            './pages/new-evaluation/new-evaluation'
          ).then(
            (component) =>
              component.NewEvaluationPage,
          ),
      },
      {
        path: 'tasks/:id/edit',
        title: 'Edit Evaluation | EvalOps',
        loadComponent: () =>
          import(
            './pages/edit-evaluation/edit-evaluation'
          ).then(
            (component) =>
              component.EditEvaluationPage,
          ),
      },
      {
        path: 'tasks/:id',
        title:
          'Evaluation Details | EvalOps',
        loadComponent: () =>
          import(
            './pages/task-details/task-details'
          ).then(
            (component) =>
              component.TaskDetailsPage,
          ),
      },
      {
        path: 'tasks',
        title: 'Evaluation Tasks | EvalOps',
        loadComponent: () =>
          import('./pages/tasks/tasks').then(
            (component) =>
              component.TasksPage,
          ),
      },
      {
        path: 'reviews',
        title: 'Reviews | EvalOps',
        canActivate: [roleGuard],
        data: {
          roles: REVIEW_ROLES,
        },
        loadComponent: () =>
          import(
            './pages/reviews/reviews'
          ).then(
            (component) =>
              component.ReviewsPage,
          ),
      },
      {
        path: 'analytics',
        title: 'Analytics | EvalOps',
        canActivate: [roleGuard],
        data: {
          roles: REVIEW_ROLES,
        },
        loadComponent: () =>
          import(
            './pages/analytics/analytics'
          ).then(
            (component) =>
              component.AnalyticsPage,
          ),
      },
      {
        path: 'settings',
        title: 'Settings | EvalOps',
        canActivate: [roleGuard],
        data: {
          roles: ADMIN_ROLES,
        },
        loadComponent: () =>
          import(
            './pages/settings/settings'
          ).then(
            (component) =>
              component.SettingsPage,
          ),
      },
      {
        path: 'unauthorized',
        title: 'Access Restricted | EvalOps',
        loadComponent: () =>
          import(
            './pages/unauthorized/unauthorized'
          ).then(
            (component) =>
              component.UnauthorizedPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
