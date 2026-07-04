import {
  Component,
  inject,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import {
  UserRole,
} from '../core/auth/auth.model';
import {
  AuthService,
} from '../core/auth/auth.service';
import {
  ApiStatus,
} from '../shared/ui/api-status/api-status';
import {
  ToastContainer,
} from '../shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ApiStatus,
    ToastContainer,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);

  protected readonly reviewRoles:
    readonly UserRole[] = [
      'admin',
      'reviewer',
    ];

  protected readonly adminRoles:
    readonly UserRole[] = [
      'admin',
    ];

  protected logout(): void {
    this.auth.logout();

    void this.router.navigate([
      '/login',
    ]);
  }
}
