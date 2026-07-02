import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AuthSession,
  DEMO_AUTH_ACCOUNTS,
} from './auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let storage:
    Record<string, string>;

  beforeEach(() => {
    storage = {};

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(
        (key: string) =>
          storage[key] ?? null,
      ),
      setItem: vi.fn(
        (
          key: string,
          value: string,
        ) => {
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

    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts without an authenticated user', () => {
    const service =
      TestBed.inject(AuthService);

    expect(
      service.isAuthenticated(),
    ).toBe(false);

    expect(
      service.currentUser(),
    ).toBeNull();
  });

  it('authenticates a valid demo account', () => {
    const service =
      TestBed.inject(AuthService);

    const account =
      DEMO_AUTH_ACCOUNTS[0];

    const result = service.login({
      email: account.email,
      password: account.password,
    });

    expect(result.success).toBe(true);

    expect(
      service.currentUser()?.role,
    ).toBe('admin');

    expect(
      sessionStorage.setItem,
    ).toHaveBeenCalled();
  });

  it('rejects invalid credentials', () => {
    const service =
      TestBed.inject(AuthService);

    const result = service.login({
      email: 'unknown@evalops.dev',
      password: 'Incorrect123!',
    });

    expect(result.success).toBe(false);

    expect(
      service.isAuthenticated(),
    ).toBe(false);
  });

  it('checks the current user role', () => {
    const service =
      TestBed.inject(AuthService);

    const account =
      DEMO_AUTH_ACCOUNTS[1];

    service.login({
      email: account.email,
      password: account.password,
    });

    expect(
      service.hasRole('reviewer'),
    ).toBe(true);

    expect(
      service.hasAnyRole([
        'admin',
        'reviewer',
      ]),
    ).toBe(true);

    expect(
      service.hasRole('admin'),
    ).toBe(false);
  });

  it('clears the session during logout', () => {
    const service =
      TestBed.inject(AuthService);

    const account =
      DEMO_AUTH_ACCOUNTS[0];

    service.login({
      email: account.email,
      password: account.password,
    });

    service.logout();

    expect(
      service.isAuthenticated(),
    ).toBe(false);

    expect(
      sessionStorage.removeItem,
    ).toHaveBeenCalledWith(
      'evalops-auth-session',
    );
  });

  it('restores a valid stored session', () => {
    const session: AuthSession = {
      user: {
        id: 'USR-2000',
        name: 'Stored Reviewer',
        email:
          'stored@evalops.dev',
        role: 'reviewer',
      },
      token: 'stored-demo-token',
      expiresAt:
        Date.now() + 60_000,
    };

    storage['evalops-auth-session'] =
      JSON.stringify(session);

    const service =
      TestBed.inject(AuthService);

    expect(
      service.currentUser()?.name,
    ).toBe('Stored Reviewer');

    expect(
      service.isAuthenticated(),
    ).toBe(true);
  });
});
