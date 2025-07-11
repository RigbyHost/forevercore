import { FastifyInstance } from 'fastify';
import { hostingDb, getGdpsDb } from '../db/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    hostingDb: typeof hostingDb;
    getGdpsDb: typeof getGdpsDb;
    redis: any; // Redis client from @fastify/redis
  }
}