# EvalOps Front-End Architecture

## Core

Application-wide infrastructure instantiated once.

- `config`: application and environment configuration
- `errors`: global error handling
- `guards`: authentication and authorization guards
- `http`: interceptors and HTTP infrastructure
- `services`: application-wide services

## Shared

Reusable presentation utilities with no feature-specific business logic.

- `ui`: reusable visual components
- `pipes`: reusable transformation pipes
- `directives`: reusable directives
- `models`: shared presentation models

## Data Access

Communication with external or persistent data sources.

- `models`: API request and response models
- `repositories`: abstractions over data sources
- `services`: HTTP and persistence implementations
- `state`: facades and reactive state stores

## Features

Business-focused application areas.

- `dashboard`
- `evaluations`
- `reviews`
- `analytics`
- `settings`

Each feature may contain pages, components, models, and feature routes that are specific to that business area.

## Dependency Direction

Features may depend on shared, data-access, and core code.

Shared code must not depend on feature code.

Data-access code must not depend on feature presentation components.

Core infrastructure must remain independent of individual feature pages.
