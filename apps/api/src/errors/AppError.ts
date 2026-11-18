// Errors we raise on purpose carry a stable code + HTTP status (see docs/02).
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
