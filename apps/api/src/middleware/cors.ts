import type { RequestHandler } from 'express';
import { env } from '../config/env';

// Minimal CORS for the browser admin app. Auth uses a Bearer token (no cookies),
// so we allow exactly one configured origin and the headers we actually send.
export const cors: RequestHandler = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', env.corsOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};
