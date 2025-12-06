// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'; // logger
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security & Logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Root endpoint providing basic API information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'DeckBuilder API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/decks'
    }
  });
});


/**
 * Health check endpoint to verify server is running
 * 
 * @returns Server status with timestamp and uptime
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
console.log('Routes loaded:', typeof routes, routes);
app.use('/api', routes);

// Error handling
app.use(notFound); // Quando n encontra rota tipo /apiasdadsdas
app.use(errorHandler);

export default app;