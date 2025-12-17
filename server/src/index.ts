// src/index.ts
import 'dotenv/config';
import app from './app';
import prisma from './configs/database';

// Servers port
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle cntrl c nicely
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