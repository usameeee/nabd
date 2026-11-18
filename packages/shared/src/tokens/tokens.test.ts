import { describe, it, expect } from 'vitest';
import {
  darkColors,
  fontFamily,
  fontSize,
  lightColors,
  motion,
  radius,
  spacing,
  themes,
} from './index';

const HEX = /^#[0-9A-F]{6}$/i;

describe('color tokens', () => {
  it('light and dark expose the same keys', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('every color value is an opaque hex (no rgba/neon)', () => {
    for (const theme of [lightColors, darkColors]) {
      for (const value of Object.values(theme)) {
        expect(value).toMatch(HEX);
      }
    }
  });

  it('action, reward and viewerBg are identical in both themes', () => {
    expect(darkColors.action).toBe(lightColors.action);
    expect(darkColors.reward).toBe(lightColors.reward);
    expect(darkColors.viewerBg).toBe(lightColors.viewerBg);
  });

  it('themes map to the two color sets', () => {
    expect(themes.light).toBe(lightColors);
    expect(themes.dark).toBe(darkColors);
  });
});

describe('scale tokens', () => {
  it('spacing follows the 4pt scale', () => {
    expect(Object.values(spacing)).toEqual([4, 8, 12, 16, 24, 32]);
  });

  it('radius pill is fully rounded', () => {
    expect(radius.pill).toBe(999);
  });

  it('no font size is below the 12px floor', () => {
    expect(Math.min(...Object.values(fontSize))).toBeGreaterThanOrEqual(12);
  });

  it('motion stays in the 150-250ms band', () => {
    for (const value of Object.values(motion)) {
      expect(value).toBeGreaterThanOrEqual(150);
      expect(value).toBeLessThanOrEqual(250);
    }
  });

  it('exposes the five brand font families', () => {
    expect(Object.values(fontFamily)).toEqual([
      'ReemKufi',
      'IBMPlexSansArabic',
      'Jost',
      'Lexend',
      'IBMPlexMono',
    ]);
  });
});
