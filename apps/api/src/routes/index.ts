import { Router } from 'express';
import { attributionsRouter } from './attributions.routes';
import { authRouter } from './auth.routes';
import { diseasesRouter } from './diseases.routes';
import { healthRouter } from './health.routes';
import { hotspotsRouter } from './hotspots.routes';
import { lessonsRouter } from './lessons.routes';
import { modelsRouter } from './models.routes';
import { termsRouter } from './terms.routes';

// Mounted at /api/v1. Feature routers (diseases, lessons, ...) get added here.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/terms', termsRouter);
apiRouter.use('/models', modelsRouter);
apiRouter.use('/hotspots', hotspotsRouter);
apiRouter.use('/diseases', diseasesRouter);
apiRouter.use('/lessons', lessonsRouter);
apiRouter.use('/attributions', attributionsRouter);
