# EvalOps — Angular AI Evaluation Dashboard

EvalOps is a responsive Angular application for managing AI evaluation tasks, reviewer workflows, quality scores, and performance analytics.

## Live Demo

https://kinyah-eng.github.io/angular-ai-evaluation-dashboard/

## Project Overview

This project demonstrates how Angular, RxJS, TypeScript, Reactive Forms, and scalable SCSS can be used to build a maintainable front-end application for AI quality-evaluation workflows.

The application uses realistic demonstration data and browser-based persistence. It does not currently connect to a production backend.

## Features

- Responsive evaluation dashboard
- Create, view, edit, complete, and delete evaluations
- Reactive task search with debouncing
- Status-based task filtering
- Reviewer action queue
- Dynamic quality and completion metrics
- Evaluation details pages
- Typed Angular Reactive Forms
- Form validation and error feedback
- Browser persistence using `localStorage`
- Lazy-loaded standalone routes
- Responsive SCSS architecture
- Vitest unit tests
- GitHub Actions continuous integration
- GitHub Pages deployment

## Angular and RxJS Concepts

The project demonstrates:

- Standalone Angular components
- Angular Router
- Lazy-loaded routes
- Reactive Forms
- Strict TypeScript models
- Dependency injection using `inject()`
- `BehaviorSubject`
- `combineLatest`
- `switchMap`
- `map`
- `debounceTime`
- `distinctUntilChanged`
- `startWith`
- `shareReplay`
- `takeUntilDestroyed`
- `AsyncPipe`
- Angular control-flow syntax
- Dynamic class and style binding

## Technology Stack

- Angular 22
- TypeScript
- RxJS
- SCSS/SASS
- Angular Reactive Forms
- Angular Router
- Vitest
- GitHub Actions
- GitHub Pages

## Application Routes

| Route | Purpose |
|---|---|
| `#/` | Performance dashboard |
| `#/tasks` | Search and manage evaluations |
| `#/tasks/new` | Create a new evaluation |
| `#/tasks/:id` | View evaluation details |
| `#/tasks/:id/edit` | Edit an evaluation |
| `#/reviews` | Process pending reviews |
| `#/analytics` | View reactive performance metrics |
| `#/settings` | Manage application preferences |

## Project Structure

```text
src/app/
├── core/
│   ├── evaluation-task.ts
│   ├── task-store.ts
│   └── task-store.spec.ts
├── layout/
│   ├── layout.ts
│   ├── layout.html
│   └── layout.scss
├── pages/
│   ├── dashboard/
│   ├── tasks/
│   ├── task-details/
│   ├── new-evaluation/
│   ├── edit-evaluation/
│   ├── reviews/
│   ├── analytics/
│   └── settings/
├── app.config.ts
├── app.routes.ts
└── app.ts
```

## State Management

The application uses a lightweight RxJS state-management service built around `BehaviorSubject`.

Components receive application state through observable streams and `AsyncPipe`. Derived values such as task totals, completion rates, filtered task lists, and average quality scores are calculated reactively.

## Local Development

### Requirements

- Node.js 24.15.0
- npm

### Clone the repository

```bash
git clone https://github.com/kinyah-eng/angular-ai-evaluation-dashboard.git
cd angular-ai-evaluation-dashboard
```

### Install dependencies

```bash
npm ci
```

### Start the development server

```bash
npm start
```

Open:

```text
http://localhost:4200
```

## Testing

Run the unit tests:

```bash
npm test -- --watch=false
```

## Production Build

Create a production build:

```bash
npm run build
```

## Data Persistence

Evaluation tasks and application settings are stored in browser `localStorage`.

This allows created and edited tasks to remain available after refreshing the page. Clearing browser storage resets the locally stored information.

## Continuous Integration and Deployment

Every push to the `main` branch automatically:

1. Installs locked dependencies.
2. Runs the unit tests.
3. Creates a production build.
4. Deploys the successful build to GitHub Pages.

Pull requests run the test and build stages without deploying.

## Future Improvements

- REST API integration
- Authentication
- Role-based authorization
- Server-side persistence
- Pagination
- Audit history
- Interactive charts
- End-to-end testing
- Dark mode
- Expanded accessibility testing

## Author

**Samuel Kamande**

- GitHub: https://github.com/kinyah-eng
- Location: Nairobi, Kenya

## License

This project is available under the MIT License.
