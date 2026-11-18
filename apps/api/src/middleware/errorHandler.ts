import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { fail } from '../utils/response';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(fail('NOT_FOUND', 'Route not found'));
};

// Express only treats this as an error handler if it has 4 parameters.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    res.status(400).json(fail('VALIDATION_ERROR', message));
    return;
  }

  const isApp = err instanceof AppError;
  const status = isApp ? err.status : 500;
  const code = isApp ? err.code : 'INTERNAL_ERROR';
  const message = isApp ? err.message : 'Internal server error';

  res.status(status).json(fail(code, message));
};
