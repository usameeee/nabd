import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCsv, parseCsvRecords } from './csv';
import { ANATOMY_LICENSE, ANATOMY_SOURCE, buildTermInput } from './terms';

describe('parseCsv', () => {
  it('splits rows and cells', () => {
    expect(parseCsv('a,b\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('keeps commas inside quoted cells', () => {
    expect(parseCsv('a,b\n"x, y",2\n')).toEqual([
      ['a', 'b'],
      ['x, y', '2'],
    ]);
  });

  it('unescapes doubled quotes', () => {
    expect(parseCsv('a\n"she said ""hi"""\n')).toEqual([['a'], ['she said "hi"']]);
  });

  it('handles CRLF and a leading BOM', () => {
    expect(parseCsv('\uFEFFa,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('parseCsvRecords', () => {
  it('maps the header onto each row', () => {
    expect(parseCsvRecords('key,en\nheart,heart\n')).toEqual([{ key: 'heart', en: 'heart' }]);
  });

  it('returns an empty list for empty input', () => {
    expect(parseCsvRecords('')).toEqual([]);
  });
});

describe('buildTermInput', () => {
  const row = {
    key: 'left_ventricle',
    ar: 'البطين الأيسر',
    fr: 'ventricule gauche',
    en: 'left ventricle',
    latin: 'Ventriculus sinister',
  };

  it('marks a curated anatomy row as needs_review', () => {
    expect(buildTermInput(row)).toMatchObject({
      key: 'left_ventricle',
      category: 'anatomy',
      source: ANATOMY_SOURCE,
      license: ANATOMY_LICENSE,
      status: 'needs_review',
      latin: 'Ventriculus sinister',
    });
  });

  it('omits latin when the column is empty', () => {
    expect(buildTermInput({ ...row, latin: '' })?.latin).toBeUndefined();
  });

  it('rejects a row missing a language (docs/03 requires ar + fr + en)', () => {
    expect(buildTermInput({ ...row, fr: '' })).toBeNull();
  });

  it('rejects a key that is not snake_case', () => {
    expect(buildTermInput({ ...row, key: 'Left Ventricle' })).toBeNull();
  });
});

describe('heart-terms.csv', () => {
  const rows = parseCsvRecords(
    readFileSync(join(process.cwd(), 'src', 'scripts', 'anatomy', 'heart-terms.csv'), 'utf8'),
  );

  it('T-023: contains at least 30 rows', () => {
    expect(rows.length).toBeGreaterThanOrEqual(30);
  });

  it('every row is a valid anatomy term', () => {
    const invalid = rows.filter((row) => buildTermInput(row) === null).map((row) => row.key);
    expect(invalid).toEqual([]);
  });

  it('has no duplicate keys', () => {
    const keys = rows.map((row) => row.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
