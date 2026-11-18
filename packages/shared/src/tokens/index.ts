// Design tokens — single source of truth for colors, type, spacing, radius.
// Values come from docs/01_BRAND_AND_DESIGN.md. Never hardcode these in components.

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  primary: string;
  text: string;
  textSecondary: string;
  action: string;
  reward: string;
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  dangerBg: string;
  dangerText: string;
  viewerBg: string;
}

export const lightColors: ThemeColors = {
  bg: '#F4EDE0',
  surface: '#FBF7EF',
  border: '#D9C9A8',
  primary: '#0F5B46',
  text: '#0F3D30',
  textSecondary: '#6B5D45',
  action: '#C8553D',
  reward: '#E3A64A',
  successBg: '#DCEBE3',
  successText: '#0F5B46',
  warningBg: '#F6E3BE',
  warningText: '#7A5410',
  dangerBg: '#F3D5CD',
  dangerText: '#8F3522',
  viewerBg: '#0C3B30',
};

export const darkColors: ThemeColors = {
  bg: '#0C3B30',
  surface: '#124A3C',
  border: '#1F6652',
  primary: '#E3A64A',
  text: '#F4EDE0',
  textSecondary: '#B9CFC5',
  action: '#C8553D',
  reward: '#E3A64A',
  successBg: '#DCEBE3',
  successText: '#0F5B46',
  warningBg: '#F6E3BE',
  warningText: '#7A5410',
  dangerBg: '#F3D5CD',
  dangerText: '#8F3522',
  viewerBg: '#0C3B30',
};

export const themes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeName = keyof typeof themes;

// 4pt spacing scale.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export type Spacing = keyof typeof spacing;

export const radius = {
  pill: 999,
  card: 14,
  button: 16,
  sheet: 22,
  frame: 26,
} as const;

export type Radius = keyof typeof radius;

// App font sizes in px. Never below caption (12).
export const fontSize = {
  caption: 12,
  body: 14,
  title: 16,
  heading: 20,
  display: 28,
} as const;

export type FontSize = keyof typeof fontSize;

// Font family names — match the keys registered with expo-font.
export const fontFamily = {
  arabicDisplay: 'ReemKufi',
  arabicBody: 'IBMPlexSansArabic',
  latinDisplay: 'Jost',
  latinBody: 'Lexend',
  mono: 'IBMPlexMono',
} as const;

export type FontFamily = keyof typeof fontFamily;

// Motion durations in ms. Short, ease-out. No parallax or heavy effects.
export const motion = {
  short: 150,
  long: 250,
} as const;

export type Motion = keyof typeof motion;
