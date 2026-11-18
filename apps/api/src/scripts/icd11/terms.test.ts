import { describe, expect, it } from 'vitest';
import type { EntityTexts } from './client';
import { ICD11_LICENSE, buildTermDraft, keyFromTitle } from './terms';

const heartTexts: EntityTexts = {
  titles: {
    ar: 'احتشاء عضلة القلب',
    fr: 'Infarctus du myocarde',
    en: 'Acute myocardial infarction',
  },
  definitions: {},
};

describe('keyFromTitle', () => {
  it('turns an ICD-11 English title into a snake_case key', () => {
    expect(keyFromTitle('Acute myocardial infarction')).toBe('acute_myocardial_infarction');
  });

  it('drops punctuation and collapses separators', () => {
    expect(keyFromTitle('Heart failure, unspecified (congestive)')).toBe(
      'heart_failure_unspecified_congestive',
    );
  });

  it('never leaves leading or trailing underscores', () => {
    expect(keyFromTitle('  ...Aortic valve stenosis...  ')).toBe('aortic_valve_stenosis');
  });

  it('returns an empty string when there is nothing to slug', () => {
    expect(keyFromTitle('...')).toBe('');
  });
});

describe('buildTermDraft', () => {
  it('maps an entity to a disease term that still needs a doctor review', () => {
    const draft = buildTermDraft('123456', heartTexts);

    expect(draft?.key).toBe('acute_myocardial_infarction');
    expect(draft?.input).toMatchObject({
      ar: 'احتشاء عضلة القلب',
      fr: 'Infarctus du myocarde',
      en: 'Acute myocardial infarction',
      category: 'disease',
      source: 'ICD11',
      license: ICD11_LICENSE,
      status: 'needs_review',
    });
  });

  it('stores the entity URI as sourceRef, normalized to https', () => {
    // The search endpoint returns linearization URIs — they must be kept verbatim.
    expect(
      buildTermDraft('http://id.who.int/icd/release/11/2026-01/mms/1025', heartTexts)?.input
        .sourceRef,
    ).toBe('https://id.who.int/icd/release/11/2026-01/mms/1025');
    expect(buildTermDraft('123456', heartTexts)?.input.sourceRef).toBe(
      'https://id.who.int/icd/entity/123456',
    );
  });

  it('skips an entity that ICD-11 did not localize into all three languages (docs/03)', () => {
    expect(buildTermDraft('123456', { titles: { en: 'Only English' }, definitions: {} })).toBeNull();
    expect(
      buildTermDraft('123456', {
        titles: { ar: 'أ', en: 'Only two' },
        definitions: {},
      }),
    ).toBeNull();
  });

  it('adds a definition only when ICD-11 provides one', () => {
    expect(buildTermDraft('123456', heartTexts)?.input.definition).toBeUndefined();

    const withDefinition = buildTermDraft('123456', {
      ...heartTexts,
      definitions: { en: 'Necrosis of heart muscle.' },
    });
    expect(withDefinition?.input.definition).toEqual({ en: 'Necrosis of heart muscle.' });
  });
});
