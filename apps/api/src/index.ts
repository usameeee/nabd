import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[nabd-api] listening on http://localhost:${env.port}${env.apiPrefix}`);
  });
}

main().catch((err) => {
  console.error('[nabd-api] failed to start:', err);
  process.exit(1);
});
