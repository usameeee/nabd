import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@nabd/shared';
import { loginSchema, registerSchema } from '@nabd/shared';
import { authenticate, register } from '../services/auth.service';
import { signAccessToken } from '../utils/jwt';
import { ok } from '../utils/response';

interface PublicUserSource {
  _id: unknown;
  email: string;
  name: string;
  role: string;
  language: string;
}

function toPublicUser(user: PublicUserSource) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  };
}

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const user = await register(input);
    const token = signAccessToken({ sub: String(user._id), role: user.role as Role });
    res.status(201).json(ok({ token, user: toPublicUser(user) }));
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const user = await authenticate(input);
    const token = signAccessToken({ sub: String(user._id), role: user.role as Role });
    res.json(ok({ token, user: toPublicUser(user) }));
  } catch (err) {
    next(err);
  }
}
