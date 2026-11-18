import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, FALLBACK_LOCALES, isRtl, translations } from './index';
import { LOCALES } from '../types/roles';

interface Leaf {
  key: string;
  value: unknown;
}

function flatten(value: object, prefix = ''): Leaf[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null
      ? flatten(child, path)
      : [{ key: path, value: child }];
  });
}

describe('i18n resources', () => {
  it('ships exactly one resource bundle per locale', () => {
    expect(Object.keys(translations).sort()).toEqual([...LOCALES].sort());
  });

  it('every locale exposes the same keys', () => {
    const reference = flatten(translations.ar).map((leaf) => leaf.key).sort();
    for (const locale of LOCALES) {
      expect(flatten(translations[locale]).map((leaf) => leaf.key).sort()).toEqual(reference);
    }
  });

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      for (const { key, value } of flatten(translations[locale])) {
        expect(value, `${locale}.${key}`).toBeTruthy();
      }
    }
  });

  it('defaults to Arabic and only Arabic is RTL', () => {
    expect(DEFAULT_LOCALE).toBe('ar');
    expect(FALLBACK_LOCALES).toEqual(['fr', 'en']);
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('fr')).toBe(false);
    expect(isRtl('en')).toBe(false);
  });
});
