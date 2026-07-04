import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  DEMO_AUTH_ACCOUNTS,
  DemoAuthAccount,
} from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  protected readonly demoAccounts =
    DEMO_AUTH_ACCOUNTS;

  protected readonly errorMessage =
    signal<string | null>(null);

  protected readonly loginForm =
    this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });

  protected useDemoAccount(
    account: DemoAuthAccount,
  ): void {
    this.errorMessage.set(null);

    this.loginForm.setValue({
      email: account.email,
      password: account.password,
    });
  }

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const result = this.auth.login(
      this.loginForm.getRawValue(),
    );

    if (!result.success) {
      this.errorMessage.set(
        result.message ??
          'Authentication failed.',
      );

      return;
    }

    void this.router.navigateByUrl(
      this.getSafeRedirectUrl(),
    );
  }

  private getSafeRedirectUrl(): string {
    const redirect =
      this.route.snapshot.queryParamMap.get(
        'redirect',
      );

    if (
      redirect &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//') &&
      redirect !== '/login'
    ) {
      return redirect;
    }

    return '/';
  }
}
