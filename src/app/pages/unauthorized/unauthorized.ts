import {
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized-page',
  imports: [RouterLink],
  templateUrl: './unauthorized.html',
  styleUrls: [
    '../page.scss',
    './unauthorized.scss',
  ],
})
export class UnauthorizedPage {
  protected readonly auth =
    inject(AuthService);
}
