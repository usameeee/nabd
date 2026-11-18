import { describe, expect, it } from 'vitest';
import { attributionListQuerySchema } from './attribution';

describe('attributionListQuerySchema', () => {
  it('applies paging defaults', () => {
    expect(attributionListQuerySchema.parse({})).toEqual({ page: 1, limit: 50 });
  });

  it('coerces query strings', () => {
    expect(attributionListQuerySchema.parse({ page: '2', limit: '10' })).toEqual({
      page: 2,
      limit: 10,
    });
  });

  it('accepts a known kind and rejects an unknown one', () => {
    expect(attributionListQuerySchema.safeParse({ kind: 'model' }).success).toBe(true);
    expect(attributionListQuerySchema.safeParse({ kind: 'poster' }).success).toBe(false);
  });
});
