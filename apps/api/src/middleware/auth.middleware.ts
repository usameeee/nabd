import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing bearer token', 401);
  }

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
  }

  next();
}

export function requireRole(...allowed: Role[]) {
  return function roleGuard(req: Request, _res: Response, next: NextFunction): void {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }
    if (!allowed.includes(req.user.role)) {
      throw new AppError('FORBIDDEN', 'Insufficient role', 403);
    }
    next();
  };
}
