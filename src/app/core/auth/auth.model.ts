export type UserRole =
  | 'admin'
  | 'reviewer'
  | 'evaluator';

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly token: string;
  readonly expiresAt: number;
}

export interface AuthResult {
  readonly success: boolean;
  readonly message?: string;
}

export interface DemoAuthAccount extends AuthUser {
  readonly password: string;
}

export const DEMO_AUTH_ACCOUNTS:
  readonly DemoAuthAccount[] = [
    {
      id: 'USR-1001',
      name: 'Samuel Kamande',
      email: 'admin@evalops.dev',
      password: 'Admin123!',
      role: 'admin',
    },
    {
      id: 'USR-1002',
      name: 'Amina Noor',
      email: 'reviewer@evalops.dev',
      password: 'Review123!',
      role: 'reviewer',
    },
    {
      id: 'USR-1003',
      name: 'Daniel Otieno',
      email: 'evaluator@evalops.dev',
      password: 'Evaluate123!',
      role: 'evaluator',
    },
  ];
