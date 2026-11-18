import { Router } from 'express';
import { listAttributionsHandler } from '../controllers/attribution.controller';

export const attributionsRouter = Router();

// Generated view over the licence fields of the content collections (docs/03 → attributions).
// Public: the credits must be readable by anyone using the app, no auth.
attributionsRouter.get('/', listAttributionsHandler);
