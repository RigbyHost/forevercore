import { FastifyInstance } from 'fastify';
import { eq, and, or, desc } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * Social features API endpoints - Friends, messages, etc.
 */
export async function registerSocialRoutes(fastify: FastifyInstance) {
  
  // Get friend requests
  fastify.post('/database/getGJFriendRequests20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const getSent = parseInt(body.getSent || '0'); // 0=received, 1=sent
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const offset = page * count;
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      let query = fastify.db
        .select()
        .from(schema.friendreqs);
      
      if (getSent) {
        query = query.where(eq(schema.friendreqs.accountID, accountID));
      } else {
        query = query.where(eq(schema.friendreqs.toAccountID, accountID));
      }
      
      const requests = await query
        .orderBy(desc(schema.friendreqs.uploadDate))
        .limit(count)
        .offset(offset);
      
      if (!requests.length) {
        return '-1';
      }
      
      const requestStrings = requests.map(req => {
        return [
          `1:${getSent ? req.toAccountID : req.accountID}`,
          `2:${req.ID}`,
          `3:${req.comment || ''}`,
          `4:0`, // new
          `9:${Math.floor(new Date(req.uploadDate).getTime() / 1000)}`
        ].join(':');
      });
      
      const response = requestStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting friend requests:', error);
      return '-1';
    }
  });
  
  // Send friend request
  fastify.post('/database/uploadFriendRequest20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const toAccountID = parseInt(body.toAccountID);
    const comment = body.comment || '';
    
    if (!accountID || !toAccountID || accountID === toAccountID) {
      return '-1';
    }
    
    try {
      // Check if already friends
      const existingFriend = await fastify.db
        .select()
        .from(schema.friendships)
        .where(or(
          and(
            eq(schema.friendships.person1, accountID),
            eq(schema.friendships.person2, toAccountID)
          ),
          and(
            eq(schema.friendships.person1, toAccountID),
            eq(schema.friendships.person2, accountID)
          )
        ))
        .limit(1);
      
      if (existingFriend.length) {
        return '-1'; // Already friends
      }
      
      // Check if request already exists
      const existingRequest = await fastify.db
        .select()
        .from(schema.friendreqs)
        .where(and(
          eq(schema.friendreqs.accountID, accountID),
          eq(schema.friendreqs.toAccountID, toAccountID)
        ))
        .limit(1);
      
      if (existingRequest.length) {
        return '-1'; // Request already sent
      }
      
      // Create friend request
      await fastify.db
        .insert(schema.friendreqs)
        .values({
          accountID,
          toAccountID,
          comment,
          uploadDate: new Date()
        });
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error sending friend request:', error);
      return '-1';
    }
  });
  
  // Accept friend request
  fastify.post('/database/acceptGJFriendRequest20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const targetAccountID = parseInt(body.targetAccountID);
    const requestID = parseInt(body.requestID);
    
    if (!accountID || !targetAccountID || !requestID) {
      return '-1';
    }
    
    try {
      // Verify the friend request exists
      const request = await fastify.db
        .select()
        .from(schema.friendreqs)
        .where(and(
          eq(schema.friendreqs.ID, requestID),
          eq(schema.friendreqs.accountID, targetAccountID),
          eq(schema.friendreqs.toAccountID, accountID)
        ))
        .limit(1);
      
      if (!request.length) {
        return '-1';
      }
      
      // Create friendship
      await fastify.db
        .insert(schema.friendships)
        .values({
          person1: accountID,
          person2: targetAccountID,
          isNew1: 1,
          isNew2: 1
        });
      
      // Delete the friend request
      await fastify.db
        .delete(schema.friendreqs)
        .where(eq(schema.friendreqs.ID, requestID));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error accepting friend request:', error);
      return '-1';
    }
  });
  
  // Get friends list
  fastify.post('/database/getGJUserList20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const type = parseInt(body.type || '0'); // 0=friends, 1=blocked
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      let friends: any[] = [];
      
      if (type === 0) {
        // Get friends
        friends = await fastify.db
          .select()
          .from(schema.friendships)
          .where(or(
            eq(schema.friendships.person1, accountID),
            eq(schema.friendships.person2, accountID)
          ));
      } else if (type === 1) {
        // Get blocked users
        friends = await fastify.db
          .select()
          .from(schema.blocks)
          .where(eq(schema.blocks.person1, accountID));
      }
      
      if (!friends.length) {
        return '-1';
      }
      
      const friendIDs = friends.map(friend => {
        if (type === 0) {
          return friend.person1 === accountID ? friend.person2 : friend.person1;
        } else {
          return friend.person2;
        }
      });
      
      return friendIDs.join(',');
      
    } catch (error) {
      fastify.log.error('Error getting friends list:', error);
      return '-1';
    }
  });
  
  // Remove friend
  fastify.post('/database/removeGJFriend20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const targetAccountID = parseInt(body.targetAccountID);
    
    if (!accountID || !targetAccountID) {
      return '-1';
    }
    
    try {
      // Remove friendship
      await fastify.db
        .delete(schema.friendships)
        .where(or(
          and(
            eq(schema.friendships.person1, accountID),
            eq(schema.friendships.person2, targetAccountID)
          ),
          and(
            eq(schema.friendships.person1, targetAccountID),
            eq(schema.friendships.person2, accountID)
          )
        ));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error removing friend:', error);
      return '-1';
    }
  });
  
  // Block user
  fastify.post('/database/blockGJUser20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const targetAccountID = parseInt(body.targetAccountID);
    
    if (!accountID || !targetAccountID || accountID === targetAccountID) {
      return '-1';
    }
    
    try {
      // Remove friendship if exists
      await fastify.db
        .delete(schema.friendships)
        .where(or(
          and(
            eq(schema.friendships.person1, accountID),
            eq(schema.friendships.person2, targetAccountID)
          ),
          and(
            eq(schema.friendships.person1, targetAccountID),
            eq(schema.friendships.person2, accountID)
          )
        ));
      
      // Check if already blocked
      const existing = await fastify.db
        .select()
        .from(schema.blocks)
        .where(and(
          eq(schema.blocks.person1, accountID),
          eq(schema.blocks.person2, targetAccountID)
        ))
        .limit(1);
      
      if (existing.length) {
        return '1'; // Already blocked
      }
      
      // Create block
      await fastify.db
        .insert(schema.blocks)
        .values({
          person1: accountID,
          person2: targetAccountID
        });
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error blocking user:', error);
      return '-1';
    }
  });
  
  // Unblock user
  fastify.post('/database/unblockGJUser20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const targetAccountID = parseInt(body.targetAccountID);
    
    if (!accountID || !targetAccountID) {
      return '-1';
    }
    
    try {
      await fastify.db
        .delete(schema.blocks)
        .where(and(
          eq(schema.blocks.person1, accountID),
          eq(schema.blocks.person2, targetAccountID)
        ));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error unblocking user:', error);
      return '-1';
    }
  });
}