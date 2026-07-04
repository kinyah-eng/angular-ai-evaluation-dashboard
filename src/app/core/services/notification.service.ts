import {
  Injectable,
  signal,
} from '@angular/core';

import {
  AppNotification,
  NotificationLevel,
} from './notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nextIdentifier = 0;

  private readonly notificationState =
    signal<readonly AppNotification[]>([]);

  readonly notifications =
    this.notificationState.asReadonly();

  success(
    title: string,
    message: string,
    durationMilliseconds = 4000,
  ): number {
    return this.show(
      'success',
      title,
      message,
      durationMilliseconds,
    );
  }

  error(
    title: string,
    message: string,
    durationMilliseconds = 0,
  ): number {
    return this.show(
      'error',
      title,
      message,
      durationMilliseconds,
    );
  }

  warning(
    title: string,
    message: string,
    durationMilliseconds = 6000,
  ): number {
    return this.show(
      'warning',
      title,
      message,
      durationMilliseconds,
    );
  }

  info(
    title: string,
    message: string,
    durationMilliseconds = 4000,
  ): number {
    return this.show(
      'info',
      title,
      message,
      durationMilliseconds,
    );
  }

  dismiss(identifier: number): void {
    this.notificationState.update(
      (notifications) =>
        notifications.filter(
          (notification) =>
            notification.id !== identifier,
        ),
    );
  }

  clear(): void {
    this.notificationState.set([]);
  }

  private show(
    level: NotificationLevel,
    title: string,
    message: string,
    durationMilliseconds: number,
  ): number {
    const identifier = ++this.nextIdentifier;

    const notification: AppNotification = {
      id: identifier,
      level,
      title,
      message,
      createdAt: new Date(),
    };

    this.notificationState.update(
      (notifications) => [
        ...notifications,
        notification,
      ],
    );

    if (durationMilliseconds > 0) {
      globalThis.setTimeout(
        () => this.dismiss(identifier),
        durationMilliseconds,
      );
    }

    return identifier;
  }
}
