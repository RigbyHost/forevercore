import { FastifyInstance } from 'fastify';
import { registerLevelsRoutes } from './gd/levels.js';
import { registerAccountsRoutes } from './gd/accounts.js';
import { registerCommentsRoutes } from './gd/comments.js';
import { registerSocialRoutes } from './gd/social.js';
import { registerSongsRoutes } from './gd/songs.js';
import { registerDailyRoutes } from './gd/daily.js';
import { registerListsRoutes } from './gd/lists.js';
import { registerRewardsRoutes } from './gd/rewards.js';

/**
 * Register all Geometry Dash compatible API routes
 */
export async function registerGDRoutes(fastify: FastifyInstance) {
  await registerLevelsRoutes(fastify);
  await registerAccountsRoutes(fastify);
  await registerCommentsRoutes(fastify);
  await registerSocialRoutes(fastify);
  await registerSongsRoutes(fastify);
  await registerDailyRoutes(fastify);
  await registerListsRoutes(fastify);
  await registerRewardsRoutes(fastify);
}