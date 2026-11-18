import type { Role } from '@nabd/shared';

// Adds the authenticated user to every Express request.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

export {};
