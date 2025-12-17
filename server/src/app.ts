// server/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

//Security and logging middleware
app.use(helmet()); // this is for security
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // usefull for debug

// cors so that the frontend can access the APi considering that they are on diferent ports
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DeckBuilder API',
    endpoints: {
      health: '/health',
      api: '/api/decks'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Load the routes under localhost/api
app.use('/api', routes);

//Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
