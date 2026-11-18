// Roles and locales are shared by API, admin and mobile (see docs/02, docs/03).
export const ROLES = ['student', 'editor', 'translator', 'doctor_reviewer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const LOCALES = ['ar', 'fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
