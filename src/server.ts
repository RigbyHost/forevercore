import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import formbody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import cookie from '@fastify/cookie';
import redis from '@fastify/redis';
import path from 'path';
import { fileURLToPath } from 'url';

// Database
import { hostingDb, getGdpsDb } from './db/index.js';

// Routes
import { registerGDRoutes } from './routes/gd-api.js';
import { registerPanelRoutes } from './routes/panel.js';
import { registerHostingRoutes } from './routes/hosting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production' 
      ? { target: 'pino-pretty' } 
      : undefined
  }
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true
});

await fastify.register(multipart);
await fastify.register(formbody);
await fastify.register(cookie);

// Static files
await fastify.register(staticFiles, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/'
});

// Redis (optional)
if (process.env.REDIS_HOST) {
  await fastify.register(redis, {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DATABASE || '0')
  });
}

// Add database connections to fastify instance
fastify.decorate('hostingDb', hostingDb);
fastify.decorate('getGdpsDb', getGdpsDb);

// Health check
fastify.get('/', async () => {
  return { 
    message: 'ForeverCore GDPS v2.0',
    status: 'running',
    timestamp: new Date().toISOString()
  };
});

// Register routes
await registerGDRoutes(fastify);
await registerPanelRoutes(fastify);
await registerHostingRoutes(fastify);

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // For GD API endpoints, return -1
  if (request.url.includes('/database/')) {
    reply.status(500).send('-1');
    return;
  }
  
  reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3010');
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    
    fastify.log.info(`ForeverCore GDPS v2.0 started on ${host}:${port}`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      fastify.log.info('Received SIGINT, shutting down gracefully...');
      await fastify.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      fastify.log.info('Received SIGTERM, shutting down gracefully...');
      await fastify.close();
      process.exit(0);
    });
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();