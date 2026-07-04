export type ApplicationErrorCode =
  | 'configuration_error'
  | 'network_error'
  | 'persistence_error'
  | 'validation_error'
  | 'authorization_error'
  | 'not_found'
  | 'unknown_error';

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    technicalMessage: string,
    readonly userMessage:
      string = 'An unexpected error occurred. Please try again.',
    readonly originalError?: unknown,
  ) {
    super(technicalMessage);

    this.name = 'ApplicationError';
  }
}
