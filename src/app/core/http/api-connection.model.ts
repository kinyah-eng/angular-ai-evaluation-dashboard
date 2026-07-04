export type ApiConnectionStatus =
  | 'checking'
  | 'online'
  | 'offline';

export interface ApiConnectionState {
  readonly status: ApiConnectionStatus;
  readonly service?: string;
  readonly version?: string;
  readonly checkedAt?: Date;
  readonly message: string;
}
