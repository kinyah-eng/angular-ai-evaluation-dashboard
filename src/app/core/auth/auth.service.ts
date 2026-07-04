import {
  computed,
  Injectable,
  signal,
} from '@angular/core';

import {
  AuthCredentials,
  AuthResult,
  AuthSession,
  AuthUser,
  DEMO_AUTH_ACCOUNTS,
  DemoAuthAccount,
  UserRole,
} from './auth.model';

const SESSION_DURATION_MILLISECONDS =
  8 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey =
    'evalops-auth-session';

  private readonly sessionState =
    signal<AuthSession | null>(
      this.loadSession(),
    );

  readonly session =
    this.sessionState.asReadonly();

  readonly currentUser = computed(
    () => this.sessionState()?.user ?? null,
  );

  readonly isAuthenticated = computed(
    () => this.sessionState() !== null,
  );

  readonly role = computed(
    () => this.currentUser()?.role ?? null,
  );

  readonly initials = computed(() => {
    const name = this.currentUser()?.name;

    if (!name) {
      return '?';
    }

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  login(
    credentials: AuthCredentials,
  ): AuthResult {
    const normalizedEmail =
      credentials.email.trim().toLowerCase();

    const account = DEMO_AUTH_ACCOUNTS.find(
      (candidate) =>
        candidate.email.toLowerCase() ===
          normalizedEmail &&
        candidate.password ===
          credentials.password,
    );

    if (!account) {
      return {
        success: false,
        message:
          'The email address or password is incorrect.',
      };
    }

    const session: AuthSession = {
      user: this.toAuthUser(account),
      token:
        `demo-${account.id}-${Date.now()}`,
      expiresAt:
        Date.now() +
        SESSION_DURATION_MILLISECONDS,
    };

    this.sessionState.set(session);
    this.persistSession(session);

    return {
      success: true,
    };
  }

  logout(): void {
    this.sessionState.set(null);

    try {
      globalThis.sessionStorage?.removeItem(
        this.storageKey,
      );
    } catch {
      // The in-memory session is still cleared.
    }
  }

  hasRole(role: UserRole): boolean {
    return this.role() === role;
  }

  hasAnyRole(
    roles: readonly UserRole[],
  ): boolean {
    const currentRole = this.role();

    return (
      currentRole !== null &&
      roles.includes(currentRole)
    );
  }

  private toAuthUser(
    account: DemoAuthAccount,
  ): AuthUser {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
  }

  private persistSession(
    session: AuthSession,
  ): void {
    try {
      globalThis.sessionStorage?.setItem(
        this.storageKey,
        JSON.stringify(session),
      );
    } catch {
      // Authentication continues in memory.
    }
  }

  private loadSession():
    AuthSession | null {
    try {
      const storedValue =
        globalThis.sessionStorage?.getItem(
          this.storageKey,
        );

      if (!storedValue) {
        return null;
      }

      const parsedValue: unknown =
        JSON.parse(storedValue);

      if (
        !this.isValidSession(parsedValue) ||
        parsedValue.expiresAt <= Date.now()
      ) {
        globalThis.sessionStorage?.removeItem(
          this.storageKey,
        );

        return null;
      }

      return parsedValue;
    } catch {
      return null;
    }
  }

  private isValidSession(
    value: unknown,
  ): value is AuthSession {
    if (
      typeof value !== 'object' ||
      value === null
    ) {
      return false;
    }

    const candidate =
      value as Partial<AuthSession>;

    return (
      typeof candidate.token === 'string' &&
      typeof candidate.expiresAt === 'number' &&
      typeof candidate.user === 'object' &&
      candidate.user !== null &&
      typeof candidate.user.id === 'string' &&
      typeof candidate.user.name === 'string' &&
      typeof candidate.user.email === 'string' &&
      this.isUserRole(candidate.user.role)
    );
  }

  private isUserRole(
    role: unknown,
  ): role is UserRole {
    return (
      role === 'admin' ||
      role === 'reviewer' ||
      role === 'evaluator'
    );
  }
}
