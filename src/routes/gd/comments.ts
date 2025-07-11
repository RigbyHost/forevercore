import { FastifyInstance } from 'fastify';
import { eq, and, desc, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * Comments API endpoints - GD compatible
 */
export async function registerCommentsRoutes(fastify: FastifyInstance) {
  
  // Get level comments
  fastify.post('/database/getGJComments21.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const mode = parseInt(body.mode || '0'); // 0=recent, 1=liked
    const offset = page * count;
    
    if (!levelID) {
      return '-1';
    }
    
    try {
      let query = fastify.db
        .select({
          commentID: schema.comments.commentID,
          comment: schema.comments.comment,
          userID: schema.comments.userID,
          userName: schema.comments.userName,
          timeStamp: schema.comments.timeStamp,
          percent: schema.comments.percent,
          isSpam: schema.comments.isSpam,
          likes: sql`0`.as('likes'), // TODO: implement likes system
          moderator: sql`0`.as('moderator') // TODO: implement moderator check
        })
        .from(schema.comments)
        .where(eq(schema.comments.levelID, levelID));
      
      // Sort by time (recent first)
      query = query.orderBy(desc(schema.comments.timeStamp));
      
      const comments = await query
        .limit(count)
        .offset(offset);
      
      if (!comments.length) {
        return '-1';
      }
      
      const commentStrings = comments.map(comment => {
        return [
          `1:${comment.commentID}`,
          `2:${comment.comment}`,
          `3:${comment.userID}`,
          `4:${comment.likes}`,
          `6:${comment.commentID}`,
          `7:${comment.isSpam}`,
          `9:${Math.floor(new Date(comment.timeStamp).getTime() / 1000)}`,
          `10:${comment.percent}`,
          `11:${comment.moderator}`,
          `12:` // color
        ].join(':');
      });
      
      const response = commentStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting comments:', error);
      return '-1';
    }
  });
  
  // Upload comment
  fastify.post('/database/uploadGJComment21.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    const comment = body.comment;
    const userID = parseInt(body.userID);
    const userName = body.userName;
    const percent = parseInt(body.percent || '0');
    const accountID = parseInt(body.accountID);
    
    if (!levelID || !comment || !userID || !userName) {
      return '-1';
    }
    
    // Basic spam protection
    if (comment.length > 200) {
      return '-1';
    }
    
    try {
      // Check if level exists
      const level = await fastify.db
        .select()
        .from(schema.levels)
        .where(eq(schema.levels.levelID, levelID))
        .limit(1);
      
      if (!level.length) {
        return '-1';
      }
      
      // Insert comment
      const [result] = await fastify.db
        .insert(schema.comments)
        .values({
          levelID,
          comment,
          userID,
          userName,
          percent,
          timeStamp: new Date(),
          isSpam: 0
        });
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error uploading comment:', error);
      return '-1';
    }
  });
  
  // Delete comment
  fastify.post('/database/deleteGJComment20.php', async (request, reply) => {
    const body = request.body as any;
    const commentID = parseInt(body.commentID);
    const accountID = parseInt(body.accountID);
    const levelID = parseInt(body.levelID);
    
    if (!commentID || !accountID) {
      return '-1';
    }
    
    try {
      // Check if user owns the comment or is level owner
      const comment = await fastify.db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.commentID, commentID))
        .limit(1);
      
      if (!comment.length) {
        return '-1';
      }
      
      const commentData = comment[0];
      
      // Get user data to check if owns comment
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, accountID))
        .limit(1);
      
      if (!user.length) {
        return '-1';
      }
      
      const userData = user[0];
      
      // Check if user owns the comment
      let canDelete = userData.userID === commentData.userID;
      
      // Or if user owns the level
      if (!canDelete && levelID) {
        const level = await fastify.db
          .select()
          .from(schema.levels)
          .where(and(
            eq(schema.levels.levelID, levelID),
            eq(schema.levels.extID, accountID)
          ))
          .limit(1);
        
        canDelete = level.length > 0;
      }
      
      if (!canDelete) {
        return '-1';
      }
      
      // Delete comment
      await fastify.db
        .delete(schema.comments)
        .where(eq(schema.comments.commentID, commentID));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error deleting comment:', error);
      return '-1';
    }
  });
  
  // Get account comments (profile comments)
  fastify.post('/database/getGJAccountComments20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const offset = page * count;
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      // Get user ID from account ID
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, accountID))
        .limit(1);
      
      if (!user.length) {
        return '-1';
      }
      
      const userID = user[0].userID;
      
      // Get comments by this user
      const comments = await fastify.db
        .select({
          commentID: schema.comments.commentID,
          comment: schema.comments.comment,
          levelID: schema.comments.levelID,
          timeStamp: schema.comments.timeStamp,
          percent: schema.comments.percent
        })
        .from(schema.comments)
        .where(eq(schema.comments.userID, userID))
        .orderBy(desc(schema.comments.timeStamp))
        .limit(count)
        .offset(offset);
      
      if (!comments.length) {
        return '-1';
      }
      
      const commentStrings = comments.map(comment => {
        return [
          `1:${comment.commentID}`,
          `2:${comment.comment}`,
          `3:${comment.levelID}`,
          `4:0`, // likes
          `9:${Math.floor(new Date(comment.timeStamp).getTime() / 1000)}`,
          `10:${comment.percent}`
        ].join(':');
      });
      
      const response = commentStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting account comments:', error);
      return '-1';
    }
  });
}