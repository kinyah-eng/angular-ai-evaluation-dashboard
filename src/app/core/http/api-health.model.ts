export interface ApiHealthResponse {
  readonly status: 'ok';
  readonly service: string;
  readonly version: string;
  readonly timestamp: string;
}
