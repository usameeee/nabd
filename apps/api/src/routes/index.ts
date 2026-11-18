import { Router } from 'express';
import { authRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { termsRouter } from './terms.routes';

// Mounted at /api/v1. Feature routers (models, hotspots, ...) get added here.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/terms', termsRouter);
