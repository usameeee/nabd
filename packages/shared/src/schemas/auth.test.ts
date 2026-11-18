import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth';
import { ROLES } from '../types/roles';

describe('registerSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = registerSchema.safeParse({
      email: 'Student@Example.com',
      password: 'supersecret',
      name: 'Amina',
    });
    expect(result.success).toBe(true);
  });

  it.each(ROLES)('accepts the %s role', (role) => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'supersecret',
      name: 'Amina',
      role,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'short', name: 'Amina' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown role', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'supersecret',
      name: 'Amina',
      role: 'superuser',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = registerSchema.safeParse({ email: 'nope', password: 'supersecret', name: 'Amina' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts email + password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});
