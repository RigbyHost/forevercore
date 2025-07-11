import { FastifyInstance } from 'fastify';
import { eq, like, sql, or } from 'drizzle-orm';
import { schema } from '../../db/index.js';

/**
 * Admin panel - Accounts management
 */
export async function registerPanelAccountsRoutes(fastify: FastifyInstance) {
  
  // Get accounts list
  fastify.get('/:gdpsid/panel/accounts', async (request, reply) => {
    const { gdpsid } = request.params as { gdpsid: string };
    const { search, page = '0', limit = '50' } = request.query as any;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = pageNum * limitNum;
    
    try {
      let query = fastify.db
        .select({
          accountID: schema.accounts.accountID,
          userName: schema.accounts.userName,
          email: schema.accounts.email,
          registerDate: schema.accounts.registerDate,
          isActive: schema.accounts.isActive,
          mS: schema.accounts.mS,
          frS: schema.accounts.frS
        })
        .from(schema.accounts);
      
      // Apply search filter
      if (search) {
        query = query.where(like(schema.accounts.userName, `%${search}%`));
      }
      
      const accounts = await query
        .limit(limitNum)
        .offset(offset);
      
      // Get total count for pagination
      const [countResult] = await fastify.db
        .select({ count: sql`COUNT(*)` })
        .from(schema.accounts)
        .where(search ? like(schema.accounts.userName, `%${search}%`) : undefined);
      
      return {
        gdpsid,
        accounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult.count,
          totalPages: Math.ceil(countResult.count / limitNum)
        }
      };
      
    } catch (error) {
      fastify.log.error('Error fetching accounts:', error);
      reply.status(500).send({ error: 'Failed to fetch accounts' });
    }
  });
  
  // Get single account details
  fastify.get('/:gdpsid/panel/accounts/:accountID', async (request, reply) => {
    const { gdpsid, accountID } = request.params as { gdpsid: string; accountID: string };
    
    try {
      const account = await fastify.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.accountID, parseInt(accountID)))
        .limit(1);
      
      if (!account.length) {
        reply.status(404).send({ error: 'Account not found' });
        return;
      }
      
      // Get associated user data
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, parseInt(accountID)))
        .limit(1);
      
      // Get account stats
      const [levelCount] = await fastify.db
        .select({ count: sql`COUNT(*)` })
        .from(schema.levels)
        .where(eq(schema.levels.extID, parseInt(accountID)));
      
      const [commentCount] = await fastify.db
        .select({ count: sql`COUNT(*)` })
        .from(schema.comments)
        .where(eq(schema.comments.userID, user.length ? user[0].userID : 0));
      
      return {
        gdpsid,
        account: account[0],
        user: user.length ? user[0] : null,
        stats: {
          levels: levelCount.count,
          comments: commentCount.count
        }
      };
      
    } catch (error) {
      fastify.log.error('Error fetching account details:', error);
      reply.status(500).send({ error: 'Failed to fetch account details' });
    }
  });
  
  // Update account
  fastify.put('/:gdpsid/panel/accounts/:accountID', async (request, reply) => {
    const { gdpsid, accountID } = request.params as { gdpsid: string; accountID: string };
    const body = request.body as any;
    
    try {
      const updates: any = {};
      
      if (body.userName) updates.userName = body.userName;
      if (body.email) updates.email = body.email;
      if (typeof body.isActive === 'number') updates.isActive = body.isActive;
      if (typeof body.mS === 'number') updates.mS = body.mS;
      if (typeof body.frS === 'number') updates.frS = body.frS;
      
      if (Object.keys(updates).length === 0) {
        reply.status(400).send({ error: 'No valid fields to update' });
        return;
      }
      
      const [result] = await fastify.db
        .update(schema.accounts)
        .set(updates)
        .where(eq(schema.accounts.accountID, parseInt(accountID)));
      
      if (result.affectedRows === 0) {
        reply.status(404).send({ error: 'Account not found' });
        return;
      }
      
      return { success: true, message: 'Account updated successfully' };
      
    } catch (error) {
      fastify.log.error('Error updating account:', error);
      reply.status(500).send({ error: 'Failed to update account' });
    }
  });
  
  // Delete account
  fastify.delete('/:gdpsid/panel/accounts/:accountID', async (request, reply) => {
    const { gdpsid, accountID } = request.params as { gdpsid: string; accountID: string };
    
    try {
      // Get user ID for cascade deletion
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, parseInt(accountID)))
        .limit(1);
      
      const userID = user.length ? user[0].userID : null;
      
      // Delete related data (cascade)
      if (userID) {
        await fastify.db
          .delete(schema.comments)
          .where(eq(schema.comments.userID, userID));
        
        await fastify.db
          .delete(schema.levels)
          .where(eq(schema.levels.userID, userID));
        
        await fastify.db
          .delete(schema.users)
          .where(eq(schema.users.userID, userID));
      }
      
      // Delete friendships and requests
      await fastify.db
        .delete(schema.friendships)
        .where(or(
          eq(schema.friendships.person1, parseInt(accountID)),
          eq(schema.friendships.person2, parseInt(accountID))
        ));
      
      await fastify.db
        .delete(schema.friendreqs)
        .where(or(
          eq(schema.friendreqs.accountID, parseInt(accountID)),
          eq(schema.friendreqs.toAccountID, parseInt(accountID))
        ));
      
      // Delete blocks
      await fastify.db
        .delete(schema.blocks)
        .where(or(
          eq(schema.blocks.person1, parseInt(accountID)),
          eq(schema.blocks.person2, parseInt(accountID))
        ));
      
      // Finally delete the account
      const [result] = await fastify.db
        .delete(schema.accounts)
        .where(eq(schema.accounts.accountID, parseInt(accountID)));
      
      if (result.affectedRows === 0) {
        reply.status(404).send({ error: 'Account not found' });
        return;
      }
      
      return { success: true, message: 'Account deleted successfully' };
      
    } catch (error) {
      fastify.log.error('Error deleting account:', error);
      reply.status(500).send({ error: 'Failed to delete account' });
    }
  });
  
  // Ban/unban account
  fastify.post('/:gdpsid/panel/accounts/:accountID/ban', async (request, reply) => {
    const { gdpsid, accountID } = request.params as { gdpsid: string; accountID: string };
    const { banned } = request.body as { banned: boolean };
    
    try {
      const [result] = await fastify.db
        .update(schema.accounts)
        .set({ isActive: banned ? 0 : 1 })
        .where(eq(schema.accounts.accountID, parseInt(accountID)));
      
      if (result.affectedRows === 0) {
        reply.status(404).send({ error: 'Account not found' });
        return;
      }
      
      return { 
        success: true, 
        message: banned ? 'Account banned successfully' : 'Account unbanned successfully' 
      };
      
    } catch (error) {
      fastify.log.error('Error banning/unbanning account:', error);
      reply.status(500).send({ error: 'Failed to update account status' });
    }
  });
}