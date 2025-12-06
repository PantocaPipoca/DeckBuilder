// src/index.ts
/**
 * Start of the web server
 * 
 * Starts the the server with express and handles graceful shutdown
 * loads environment variables, connects to the database, and listens for HTTP requests.
 */
import 'dotenv/config';
import app from './app';
import prisma from './configs/database';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Graceful shutdown handler
 * 
 * Stops new requests, 
 * Finishes existing requests, 
 * Closes database connections (DOESNT CLOSE THE FKNG DOCKER), 
 * Force exit if 10 secs excedet
 * 
 * @param signal - The shutdown signal received (SIGTERM or SIGINT not forced)
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received.`);
  
  server.close(async () => {
    console.log('HTTP closed no more requests.');
    
    try {
      await prisma.$disconnect();
      console.log('Database down.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if some bad bad shi happens
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));