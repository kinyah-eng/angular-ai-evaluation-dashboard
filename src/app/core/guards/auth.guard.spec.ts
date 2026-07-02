import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthService } from '../auth/auth.service';
import {
  authChildGuard,
  authGuard,
} from './auth.guard';

describe('authentication guards', () => {
  const redirectTree = {
    redirect: true,
  };

  const authMock = {
    isAuthenticated: vi.fn(),
  };

  const routerMock = {
    createUrlTree: vi.fn(
      () => redirectTree,
    ),
  };

  const route =
    {} as ActivatedRouteSnapshot;

  const state = {
    url: '/analytics',
  } as RouterStateSnapshot;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  it('allows authenticated navigation', () => {
    authMock.isAuthenticated
      .mockReturnValue(true);

    const result =
      TestBed.runInInjectionContext(
        () => authGuard(route, state),
      );

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users', () => {
    authMock.isAuthenticated
      .mockReturnValue(false);

    const result =
      TestBed.runInInjectionContext(
        () => authGuard(route, state),
      );

    expect(result).toBe(redirectTree);

    expect(
      routerMock.createUrlTree,
    ).toHaveBeenCalledWith(
      ['/login'],
      {
        queryParams: {
          redirect: '/analytics',
        },
      },
    );
  });

  it('protects child routes', () => {
    authMock.isAuthenticated
      .mockReturnValue(false);

    const result =
      TestBed.runInInjectionContext(
        () =>
          authChildGuard(
            route,
            state,
          ),
      );

    expect(result).toBe(redirectTree);
  });
});
