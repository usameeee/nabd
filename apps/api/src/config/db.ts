import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('[nabd-api] MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[nabd-api] MongoDB error:', err.message);
  });

  await mongoose.connect(env.mongodbUri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
