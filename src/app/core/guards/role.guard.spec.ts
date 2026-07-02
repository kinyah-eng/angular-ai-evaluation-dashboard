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
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const redirectTree = {
    redirect: true,
  };

  const authMock = {
    hasAnyRole: vi.fn(),
  };

  const routerMock = {
    createUrlTree: vi.fn(
      () => redirectTree,
    ),
  };

  const state = {
    url: '/settings',
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

  it('allows routes without role restrictions', () => {
    const route = {
      data: {},
    } as ActivatedRouteSnapshot;

    const result =
      TestBed.runInInjectionContext(
        () => roleGuard(route, state),
      );

    expect(result).toBe(true);
  });

  it('allows users with an accepted role', () => {
    authMock.hasAnyRole
      .mockReturnValue(true);

    const route = {
      data: {
        roles: ['admin'],
      },
    } as unknown as
      ActivatedRouteSnapshot;

    const result =
      TestBed.runInInjectionContext(
        () => roleGuard(route, state),
      );

    expect(result).toBe(true);

    expect(
      authMock.hasAnyRole,
    ).toHaveBeenCalledWith(
      ['admin'],
    );
  });

  it('redirects users without an accepted role', () => {
    authMock.hasAnyRole
      .mockReturnValue(false);

    const route = {
      data: {
        roles: ['admin'],
      },
    } as unknown as
      ActivatedRouteSnapshot;

    const result =
      TestBed.runInInjectionContext(
        () => roleGuard(route, state),
      );

    expect(result).toBe(redirectTree);

    expect(
      routerMock.createUrlTree,
    ).toHaveBeenCalledWith(
      ['/unauthorized'],
      {
        queryParams: {
          from: '/settings',
        },
      },
    );
  });
});
