import {
  Component,
  inject,
} from '@angular/core';

import { NotificationLevel } from '../../../core/services/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected readonly notificationService =
    inject(NotificationService);

  protected notificationRole(
    level: NotificationLevel,
  ): 'alert' | 'status' {
    return level === 'error' ||
      level === 'warning'
      ? 'alert'
      : 'status';
  }
}
