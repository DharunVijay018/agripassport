import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { errorHandler } from './middleware/error-handler';
import { config } from './config/env';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(express.json());

  // Mount API
  app.use('/api', apiRouter);

  // Root Welcome Endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'AgriPassport API',
      description: 'AI-Powered Blockchain Digital Passport for Farm-to-Fork Traceability',
      docs: '/api/health',
      endpoints: {
        health: '/api/health',
        farmers: '/api/farmers',
        batches: '/api/batches',
        events: '/api/batches/:batchId/events',
        verifyHash: '/api/verify-hash',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
