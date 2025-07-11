import { FastifyInstance } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import { hostingSchema, createGdpsDatabase, deleteGdpsDatabase, schema } from '../db/index.js';
import { setGdpsConfig, deleteGdpsConfig } from '../services/gdps-config.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';

/**
 * Hosting management API routes
 */
export async function registerHostingRoutes(fastify: FastifyInstance) {
  
  // Create new GDPS instance
  fastify.post('/hosting/gdps', async (request, reply) => {
    const body = request.body as any;
    const { id, name, domain, ownerId, settings } = body;
    
    if (!id || !name || !ownerId) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    
    try {
      // Check if GDPS ID already exists
      const existing = await fastify.hostingDb
        .select()
        .from(hostingSchema.gdpsInstances)
        .where(eq(hostingSchema.gdpsInstances.id, id))
        .limit(1);
      
      if (existing.length) {
        return reply.status(409).send({ error: 'GDPS ID already exists' });
      }
      
      // Create database for new GDPS
      const dbCreated = await createGdpsDatabase(id);
      if (!dbCreated) {
        return reply.status(500).send({ error: 'Failed to create GDPS database' });
      }
      
      // Create GDPS instance record
      await fastify.hostingDb
        .insert(hostingSchema.gdpsInstances)
        .values({
          id,
          name,
          domain,
          ownerId,
          status: 'active',
          settings: settings || {},
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      // Set default config in Redis
      if (settings) {
        await setGdpsConfig(fastify, id, settings);
      }
      
      return {
        success: true,
        gdps: { id, name, domain, status: 'active' }
      };
      
    } catch (error) {
      fastify.log.error('Error creating GDPS:', error);
      return reply.status(500).send({ error: 'Failed to create GDPS' });
    }
  });
  
  // Get GDPS instances for user
  fastify.get('/hosting/gdps', async (request, reply) => {
    const { userId } = request.query as any;
    
    if (!userId) {
      return reply.status(400).send({ error: 'User ID required' });
    }
    
    try {
      const instances = await fastify.hostingDb
        .select()
        .from(hostingSchema.gdpsInstances)
        .where(eq(hostingSchema.gdpsInstances.ownerId, parseInt(userId)));
      
      return { instances };
      
    } catch (error) {
      fastify.log.error('Error fetching GDPS instances:', error);
      return reply.status(500).send({ error: 'Failed to fetch instances' });
    }
  });
  
  // Get single GDPS instance
  fastify.get('/hosting/gdps/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const instance = await fastify.hostingDb
        .select()
        .from(hostingSchema.gdpsInstances)
        .where(eq(hostingSchema.gdpsInstances.id, id))
        .limit(1);
      
      if (!instance.length) {
        return reply.status(404).send({ error: 'GDPS not found' });
      }
      
      return { gdps: instance[0] };
      
    } catch (error) {
      fastify.log.error('Error fetching GDPS:', error);
      return reply.status(500).send({ error: 'Failed to fetch GDPS' });
    }
  });
  
  // Update GDPS instance
  fastify.put('/hosting/gdps/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    try {
      const updates: any = {};
      
      if (body.name) updates.name = body.name;
      if (body.domain) updates.domain = body.domain;
      if (body.status) updates.status = body.status;
      if (body.settings) updates.settings = body.settings;
      
      if (Object.keys(updates).length === 0) {
        return reply.status(400).send({ error: 'No fields to update' });
      }
      
      updates.updatedAt = new Date();
      
      const [result] = await fastify.hostingDb
        .update(hostingSchema.gdpsInstances)
        .set(updates)
        .where(eq(hostingSchema.gdpsInstances.id, id));
      
      if (result.affectedRows === 0) {
        return reply.status(404).send({ error: 'GDPS not found' });
      }
      
      // Update Redis config if settings changed
      if (body.settings) {
        await setGdpsConfig(fastify, id, body.settings);
      }
      
      return { success: true, message: 'GDPS updated successfully' };
      
    } catch (error) {
      fastify.log.error('Error updating GDPS:', error);
      return reply.status(500).send({ error: 'Failed to update GDPS' });
    }
  });
  
  // Delete GDPS instance
  fastify.delete('/hosting/gdps/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      // Delete database
      const dbDeleted = await deleteGdpsDatabase(id);
      if (!dbDeleted) {
        fastify.log.warn(`Failed to delete database for GDPS ${id}`);
      }
      
      // Delete Redis config
      await deleteGdpsConfig(fastify, id);
      
      // Delete instance record
      const [result] = await fastify.hostingDb
        .delete(hostingSchema.gdpsInstances)
        .where(eq(hostingSchema.gdpsInstances.id, id));
      
      if (result.affectedRows === 0) {
        return reply.status(404).send({ error: 'GDPS not found' });
      }
      
      return { success: true, message: 'GDPS deleted successfully' };
      
    } catch (error) {
      fastify.log.error('Error deleting GDPS:', error);
      return reply.status(500).send({ error: 'Failed to delete GDPS' });
    }
  });
  
  // Register hosting user
  fastify.post('/hosting/register', async (request, reply) => {
    const body = request.body as any;
    const { email, password, name } = body;
    
    if (!email || !password || !name) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    
    try {
      // Check if email exists
      const existing = await fastify.hostingDb
        .select()
        .from(hostingSchema.hostingUsers)
        .where(eq(hostingSchema.hostingUsers.email, email))
        .limit(1);
      
      if (existing.length) {
        return reply.status(409).send({ error: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const [result] = await fastify.hostingDb
        .insert(hostingSchema.hostingUsers)
        .values({
          email,
          password: hashedPassword,
          name,
          role: 'user',
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return {
        success: true,
        user: {
          id: result.insertId,
          email,
          name,
          role: 'user'
        }
      };
      
    } catch (error) {
      fastify.log.error('Error registering user:', error);
      return reply.status(500).send({ error: 'Failed to register user' });
    }
  });
  
  // Login hosting user
  fastify.post('/hosting/login', async (request, reply) => {
    const body = request.body as any;
    const { email, password } = body;
    
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }
    
    try {
      const user = await fastify.hostingDb
        .select()
        .from(hostingSchema.hostingUsers)
        .where(eq(hostingSchema.hostingUsers.email, email))
        .limit(1);
      
      if (!user.length) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      const userData = user[0];
      
      if (!userData.isActive) {
        return reply.status(403).send({ error: 'Account is deactivated' });
      }
      
      // Verify password
      const isValid = await verifyPassword(password, userData.password);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // TODO: Generate JWT token
      
      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        }
      };
      
    } catch (error) {
      fastify.log.error('Error logging in user:', error);
      return reply.status(500).send({ error: 'Failed to login' });
    }
  });
  
  // Get hosting plans
  fastify.get('/hosting/plans', async (request, reply) => {
    try {
      const plans = await fastify.hostingDb
        .select()
        .from(hostingSchema.hostingPlans)
        .where(eq(hostingSchema.hostingPlans.isActive, 1));
      
      return { plans };
      
    } catch (error) {
      fastify.log.error('Error fetching plans:', error);
      return reply.status(500).send({ error: 'Failed to fetch plans' });
    }
  });
  
  // GDPS statistics
  fastify.get('/hosting/gdps/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const db = fastify.getGdpsDb(id);
      
      // Get basic stats
      const stats = await Promise.all([
        db.select({ count: sql`COUNT(*)` }).from(schema.accounts),
        db.select({ count: sql`COUNT(*)` }).from(schema.levels), 
        db.select({ count: sql`COUNT(*)` }).from(schema.comments),
        db.select({ count: sql`COUNT(*)` }).from(schema.songs)
      ]);
      
      return {
        gdpsId: id,
        stats: {
          accounts: stats[0][0].count,
          levels: stats[1][0].count,
          comments: stats[2][0].count,
          songs: stats[3][0].count
        }
      };
      
    } catch (error) {
      fastify.log.error('Error fetching GDPS stats:', error);
      return reply.status(500).send({ error: 'Failed to fetch stats' });
    }
  });
}