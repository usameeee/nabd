// Loads apps/api/.env into process.env when present (Node >= 20.12).
// Real environment variables always win; .env is optional and never committed.
try {
  process.loadEnvFile();
} catch {
  // no .env file — continue with the ambient environment
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: '/api/v1',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/nabd',
  // Browser origin allowed to call the API (the admin Vite dev server by default).
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  // Dev fallback only — a real JWT_SECRET must be set outside development.
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  // WHO ICD-11 API — used only by the T-022 import script. Free key: https://icd.who.int/icdapi
  icd11ClientId: process.env.ICD11_CLIENT_ID ?? '',
  icd11ClientSecret: process.env.ICD11_CLIENT_SECRET ?? '',
  // WHO ICD-11 release to read, as YYYY-MM (list: https://icd.who.int/docs/icd-api/SupportedClassifications).
  icd11Release: process.env.ICD11_RELEASE ?? '2026-01',
} as const;
