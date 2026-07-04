import {
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  ApiHealthService,
} from '../../../core/http/api-health.service';

@Component({
  selector: 'app-api-status',
  imports: [DatePipe],
  templateUrl: './api-status.html',
  styleUrl: './api-status.scss',
})
export class ApiStatus {
  protected readonly health =
    inject(ApiHealthService);

  protected readonly statusLabel =
    computed(() => {
      switch (
        this.health.state().status
      ) {
        case 'online':
          return 'API online';

        case 'offline':
          return 'API offline';

        default:
          return 'Checking API';
      }
    });

  protected refresh(): void {
    this.health.refresh();
  }
}
