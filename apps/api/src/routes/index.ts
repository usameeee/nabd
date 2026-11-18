import { Router } from 'express';
import { authRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { hotspotsRouter } from './hotspots.routes';
import { modelsRouter } from './models.routes';
import { termsRouter } from './terms.routes';

// Mounted at /api/v1. Feature routers (diseases, lessons, ...) get added here.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/terms', termsRouter);
apiRouter.use('/models', modelsRouter);
apiRouter.use('/hotspots', hotspotsRouter);
