import { darkColors, fontFamily, fontSize, lightColors, radius, spacing } from '@nabd/shared';

// The web font family names differ from the Expo font keys in the token object,
// so we map the token keys to their CSS family stacks here (docs/01).
const webFonts: Record<keyof typeof fontFamily, string> = {
  arabicDisplay: "'Reem Kufi', serif",
  arabicBody: "'IBM Plex Sans Arabic', sans-serif",
  latinDisplay: "'Jost', sans-serif",
  latinBody: "'Lexend', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const toKebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Single source of truth: push the shared design tokens into CSS variables so no
// hex value or font name is ever hardcoded in a stylesheet (docs/01, AGENTS.md).
export function applyTokens(): void {
  const root = document.documentElement.style;

  for (const [key, value] of Object.entries(lightColors)) {
    root.setProperty(`--color-${toKebab(key)}`, value);
  }
  for (const [key, value] of Object.entries(spacing)) {
    root.setProperty(`--space-${key}`, `${value}px`);
  }
  for (const [key, value] of Object.entries(radius)) {
    root.setProperty(`--radius-${toKebab(key)}`, `${value}px`);
  }
  for (const [key, value] of Object.entries(fontSize)) {
    root.setProperty(`--font-${toKebab(key)}`, `${value}px`);
  }
  for (const [key, value] of Object.entries(webFonts)) {
    root.setProperty(`--font-family-${toKebab(key)}`, value);
  }

  // The sidebar is a fixed emerald surface, so its text colors come from the
  // opposite palette (same trick as the mobile Home "inverted" card) — no new tokens.
  root.setProperty('--color-on-primary', lightColors.bg);
  root.setProperty('--color-on-primary-muted', darkColors.textSecondary);
  root.setProperty('--color-on-primary-surface', darkColors.border);
}
