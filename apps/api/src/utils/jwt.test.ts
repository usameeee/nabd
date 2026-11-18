import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from './jwt';

describe('access tokens', () => {
  it('round-trips sub + role', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'editor' });
    expect(verifyAccessToken(token)).toEqual({ sub: 'user-1', role: 'editor' });
  });

  it('throws on a tampered token', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'student' });
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });

  it('throws on a token signed with a wrong secret', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow();
  });
});
