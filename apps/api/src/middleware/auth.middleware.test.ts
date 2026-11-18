import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { ROLES, type Role } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { signAccessToken } from '../utils/jwt';
import { authenticate, requireRole } from './auth.middleware';

const res = {} as Response;
const noop = vi.fn() as unknown as NextFunction;
const roleCases = ROLES.map((role) => [role] as const);

function reqWith(role?: Role): Request {
  return { user: role ? { id: 'u1', role } : undefined } as unknown as Request;
}

describe('requireRole', () => {
  it.each(roleCases)('allows %s into a guard that includes it', (role) => {
    const next = vi.fn();
    requireRole(role)(reqWith(role), res, next as unknown as NextFunction);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each(roleCases)('handles %s against an admin-only guard', (role) => {
    const next = vi.fn();
    if (role === 'admin') {
      requireRole('admin')(reqWith(role), res, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledTimes(1);
      return;
    }
    expect(() =>
      requireRole('admin')(reqWith(role), res, next as unknown as NextFunction),
    ).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies unauthenticated requests', () => {
    expect(() => requireRole('student')(reqWith(), res, noop)).toThrowError(/Not authenticated/);
  });
});

describe('authenticate', () => {
  it('attaches the user from a valid bearer token', () => {
    const token = signAccessToken({ sub: 'u1', role: 'editor' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const next = vi.fn();

    authenticate(req, res, next as unknown as NextFunction);

    expect(req.user).toEqual({ id: 'u1', role: 'editor' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws UNAUTHORIZED when the header is missing', () => {
    const req = { headers: {} } as unknown as Request;
    expect(() => authenticate(req, res, noop)).toThrowError(/Missing bearer token/);
  });

  it('throws UNAUTHORIZED for a malformed token', () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } } as unknown as Request;
    expect(() => authenticate(req, res, noop)).toThrowError(/Invalid or expired token/);
  });
});
