import { FastifyInstance } from 'fastify';
import { eq, like, desc, and, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * User Lists API endpoints - GD compatible
 */
export async function registerListsRoutes(fastify: FastifyInstance) {
  
  // Get user lists
  fastify.post('/database/getGJLevelLists.php', async (request, reply) => {
    const body = request.body as any;
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const str = body.str || '';
    const type = parseInt(body.type || '0');
    const offset = page * count;
    
    try {
      let query = fastify.db.select().from(schema.lists);
      
      // Apply search filters
      if (str && type === 0) {
        // Search by name
        query = query.where(like(schema.lists.listName, `%${str}%`));
      } else if (str && type === 2) {
        // Search by user
        query = query.where(like(schema.lists.userName, `%${str}%`));
      }
      
      // Exclude unlisted lists unless owned by user
      query = query.where(eq(schema.lists.unlisted, 0));
      
      const lists = await query
        .orderBy(desc(schema.lists.uploadDate))
        .limit(count)
        .offset(offset);
      
      if (!lists.length) {
        return '-1';
      }
      
      const listStrings = lists.map(list => {
        return [
          `1:${list.listID}`,
          `2:${list.listName}`,
          `3:${list.listDesc || ''}`,
          `5:${list.listVersion}`,
          `6:${list.userID}`,
          `7:${list.difficulty}`,
          `10:${list.downloads}`,
          `14:${list.likes}`,
          `19:0`, // featured
          `28:${Math.floor(new Date(list.uploadDate).getTime() / 1000)}`,
          `29:${Math.floor(new Date(list.updateDate).getTime() / 1000)}`,
          `50:${list.userName}`,
          `51:${list.listLevels}`, // level IDs
          `55:${list.icon}`,
          `56:${list.color1}`,
          `57:${list.color2}`
        ].join(':');
      });
      
      const response = listStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting lists:', error);
      return '-1';
    }
  });
  
  // Upload user list
  fastify.post('/database/uploadGJLevelList.php', async (request, reply) => {
    const body = request.body as any;
    
    const listName = body.listName;
    const listDesc = body.listDesc;
    const listLevels = body.listLevels; // comma-separated level IDs
    const listVersion = parseInt(body.listVersion || '1');
    const userID = parseInt(body.userID);
    const accountID = parseInt(body.accountID);
    const userName = body.userName;
    const difficulty = parseInt(body.difficulty || '0');
    const unlisted = parseInt(body.unlisted || '0');
    const icon = parseInt(body.icon || '0');
    const color1 = parseInt(body.color1 || '0');
    const color2 = parseInt(body.color2 || '0');
    
    if (!listName || !listLevels || !userID || !userName) {
      return '-1';
    }
    
    // Validate level IDs
    const levelIds = listLevels.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    if (levelIds.length === 0) {
      return '-1';
    }
    
    // Check if levels exist
    const existingLevels = await fastify.db
      .select({ levelID: schema.levels.levelID })
      .from(schema.levels)
      .where(sql`${schema.levels.levelID} IN (${levelIds.join(',')})`);
    
    if (existingLevels.length !== levelIds.length) {
      return '-1'; // Some levels don't exist
    }
    
    try {
      const [result] = await fastify.db
        .insert(schema.lists)
        .values({
          listName,
          listDesc,
          listLevels,
          listVersion,
          userID,
          accountID,
          userName,
          difficulty,
          unlisted,
          icon,
          color1,
          color2,
          uploadDate: new Date(),
          updateDate: new Date()
        });
      
      return result.insertId.toString();
      
    } catch (error) {
      fastify.log.error('Error uploading list:', error);
      return '-1';
    }
  });
  
  // Get single list
  fastify.post('/database/getGJLevelList.php', async (request, reply) => {
    const body = request.body as any;
    const listID = parseInt(body.listID);
    
    if (!listID) {
      return '-1';
    }
    
    try {
      const list = await fastify.db
        .select()
        .from(schema.lists)
        .where(eq(schema.lists.listID, listID))
        .limit(1);
      
      if (!list.length) {
        return '-1';
      }
      
      const listData = list[0];
      
      // Increment download count
      await fastify.db
        .update(schema.lists)
        .set({ downloads: (listData.downloads || 0) + 1 })
        .where(eq(schema.lists.listID, listID));
      
      // Format response
      const response = [
        `1:${listData.listID}`,
        `2:${listData.listName}`,
        `3:${listData.listDesc || ''}`,
        `5:${listData.listVersion}`,
        `6:${listData.userID}`,
        `7:${listData.difficulty}`,
        `10:${listData.downloads + 1}`,
        `14:${listData.likes}`,
        `19:0`, // featured
        `28:${Math.floor(new Date(listData.uploadDate).getTime() / 1000)}`,
        `29:${Math.floor(new Date(listData.updateDate).getTime() / 1000)}`,
        `50:${listData.userName}`,
        `51:${listData.listLevels}`,
        `55:${listData.icon}`,
        `56:${listData.color1}`,
        `57:${listData.color2}`
      ].join(':');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting list:', error);
      return '-1';
    }
  });
  
  // Update list
  fastify.post('/database/updateGJLevelList.php', async (request, reply) => {
    const body = request.body as any;
    const listID = parseInt(body.listID);
    const listName = body.listName;
    const listDesc = body.listDesc;
    const listLevels = body.listLevels;
    const accountID = parseInt(body.accountID);
    
    if (!listID || !accountID) {
      return '-1';
    }
    
    try {
      const updates: any = {};
      
      if (listName) updates.listName = listName;
      if (listDesc !== undefined) updates.listDesc = listDesc;
      if (listLevels) {
        // Validate level IDs
        const levelIds = listLevels.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        if (levelIds.length > 0) {
          updates.listLevels = listLevels;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        updates.updateDate = new Date();
        updates.listVersion = sql`${schema.lists.listVersion} + 1`;
        
        const [result] = await fastify.db
          .update(schema.lists)
          .set(updates)
          .where(and(
            eq(schema.lists.listID, listID),
            eq(schema.lists.accountID, accountID)
          ));
        
        if (result.affectedRows === 0) {
          return '-1';
        }
      }
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error updating list:', error);
      return '-1';
    }
  });
  
  // Delete list
  fastify.post('/database/deleteGJLevelList.php', async (request, reply) => {
    const body = request.body as any;
    const listID = parseInt(body.listID);
    const accountID = parseInt(body.accountID);
    
    if (!listID || !accountID) {
      return '-1';
    }
    
    try {
      const [result] = await fastify.db
        .delete(schema.lists)
        .where(and(
          eq(schema.lists.listID, listID),
          eq(schema.lists.accountID, accountID)
        ));
      
      if (result.affectedRows === 0) {
        return '-1';
      }
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error deleting list:', error);
      return '-1';
    }
  });
  
  // Like list
  fastify.post('/database/likeGJItem211.php', async (request, reply) => {
    const body = request.body as any;
    const itemID = parseInt(body.itemID);
    const like = parseInt(body.like); // 1=like, 0=dislike
    const type = parseInt(body.type); // 3=list
    const accountID = parseInt(body.accountID);
    
    if (!itemID || !accountID || type !== 3) {
      return '-1';
    }
    
    try {
      // Check if user already liked this list
      // This would typically be in a separate likes table
      // For now, just increment/decrement likes count
      
      const increment = like === 1 ? 1 : -1;
      
      await fastify.db
        .update(schema.lists)
        .set({ 
          likes: sql`GREATEST(0, ${schema.lists.likes} + ${increment})`
        })
        .where(eq(schema.lists.listID, itemID));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error liking list:', error);
      return '-1';
    }
  });
}