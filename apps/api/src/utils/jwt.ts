import jwt from 'jsonwebtoken';
import type { Role } from '@nabd/shared';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (
    typeof decoded === 'string' ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.role !== 'string'
  ) {
    throw new Error('Malformed token payload');
  }
  return { sub: decoded.sub, role: decoded.role as Role };
}
