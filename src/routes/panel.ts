import { FastifyInstance } from 'fastify';
import { registerPanelAccountsRoutes } from './panel/accounts.js';

/**
 * Register admin panel routes
 * These routes maintain the /:gdpsid/panel/* structure for admin interface
 */
export async function registerPanelRoutes(fastify: FastifyInstance) {
  
  // Panel main page
  fastify.get('/:gdpsid/panel', async (request, reply) => {
    const { gdpsid } = request.params as { gdpsid: string };
    
    return {
      title: `ForeverCore GDPS - ${gdpsid}`,
      message: 'Admin Panel v2.0',
      gdpsid,
      features: [
        'Account Management',
        'Level Management', 
        'Music Management',
        'Statistics',
        'Leaderboards',
        'Map Packs & Gauntlets',
        'Role Management'
      ]
    };
  });
  
  // Register sub-routes
  await registerPanelAccountsRoutes(fastify);
}