import express, { type Express } from 'express';
import { env } from './config/env';
import { cors } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(cors);
  app.use(express.json());
  app.use(env.apiPrefix, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
