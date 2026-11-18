import { describe, expect, it } from 'vitest';
import { createTermSchema, termListQuerySchema, updateTermSchema } from './term';

const validTerm = {
  key: 'left_ventricle',
  ar: 'البطين الأيسر',
  fr: 'ventricule gauche',
  en: 'left ventricle',
  category: 'anatomy',
  source: 'TA2',
  license: 'CC BY 4.0',
};

describe('createTermSchema', () => {
  it('accepts a valid term', () => {
    expect(createTermSchema.safeParse(validTerm).success).toBe(true);
  });

  it('rejects a key that is not snake_case', () => {
    expect(createTermSchema.safeParse({ ...validTerm, key: 'Left Ventricle' }).success).toBe(false);
  });

  it('requires ar, fr and en', () => {
    const { en, ...missingEn } = validTerm;
    expect(createTermSchema.safeParse(missingEn).success).toBe(false);
  });

  it('rejects an unknown category', () => {
    expect(createTermSchema.safeParse({ ...validTerm, category: 'food' }).success).toBe(false);
  });
});

describe('updateTermSchema', () => {
  it('allows a partial patch and forbids changing the key', () => {
    expect(updateTermSchema.safeParse({ fr: 'ventricule gauche' }).success).toBe(true);
    expect(updateTermSchema.safeParse({ key: 'other_key' }).success).toBe(false);
  });
});

describe('termListQuerySchema', () => {
  it('applies paging defaults and coerces query strings', () => {
    expect(termListQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(termListQuerySchema.parse({ page: '3', limit: '50' })).toEqual({ page: 3, limit: 50 });
  });

  it('rejects a limit above the maximum', () => {
    expect(termListQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
  });
});
