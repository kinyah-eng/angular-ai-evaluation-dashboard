import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((component) => component.Layout),
    children: [
      {
        path: '',
        title: 'Dashboard | EvalOps',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(
            (component) => component.Dashboard,
          ),
      },
      {
        path: 'tasks/new',
        title: 'New Evaluation | EvalOps',
        loadComponent: () =>
          import('./pages/new-evaluation/new-evaluation').then(
            (component) => component.NewEvaluationPage,
          ),
      },
      {
        path: 'tasks',
        title: 'Evaluation Tasks | EvalOps',
        loadComponent: () =>
          import('./pages/tasks/tasks').then(
            (component) => component.TasksPage,
          ),
      },
      {
        path: 'reviews',
        title: 'Reviews | EvalOps',
        loadComponent: () =>
          import('./pages/reviews/reviews').then(
            (component) => component.ReviewsPage,
          ),
      },
      {
        path: 'analytics',
        title: 'Analytics | EvalOps',
        loadComponent: () =>
          import('./pages/analytics/analytics').then(
            (component) => component.AnalyticsPage,
          ),
      },
      {
        path: 'settings',
        title: 'Settings | EvalOps',
        loadComponent: () =>
          import('./pages/settings/settings').then(
            (component) => component.SettingsPage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
