export type NotificationLevel =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface AppNotification {
  readonly id: number;
  readonly level: NotificationLevel;
  readonly title: string;
  readonly message: string;
  readonly createdAt: Date;
}
