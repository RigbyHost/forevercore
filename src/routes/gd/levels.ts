import { FastifyInstance } from 'fastify';
import { eq, and, like, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';
import { extractGdpsId, getRequestGdpsDb } from '../../utils/gdps-middleware.js';
import { checkRateLimit } from '../../services/gdps-config.js';

/**
 * Levels API endpoints - GD compatible
 */
export async function registerLevelsRoutes(fastify: FastifyInstance) {
  
  // Download single level
  fastify.post('/database/downloadGJLevel21.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    
    if (!levelID) {
      return '-1';
    }
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      const level = await db
        .select()
        .from(schema.levels)
        .where(eq(schema.levels.levelID, levelID))
        .limit(1);
      
      if (!level.length) {
        return '-1';
      }
      
      const levelData = level[0];
      
      // Format response in GD format
      const response = [
        `1:${levelData.levelID}`,
        `2:${levelData.levelName}`,
        `3:${levelData.levelDesc || ''}`,
        `4:${levelData.levelString}`,
        `5:${levelData.levelVersion}`,
        `6:${levelData.userID}`,
        `8:10`, // difficulty
        `9:${levelData.levelLength}`,
        `10:${levelData.objects}`,
        `12:${levelData.audioTrack}`,
        `13:${levelData.gameVersion}`,
        `14:${levelData.auto}`,
        `17:0`, // demons
        `18:${levelData.requestedStars || 0}`,
        `19:${levelData.requestedStars}`,
        `25:${levelData.auto}`,
        `26:''`, // record string
        `27:${levelData.password || ''}`,
        `28:${levelData.uploadDate}`,
        `29:${levelData.updateDate}`,
        `30:${levelData.original}`,
        `31:${levelData.twoPlayer}`,
        `35:${levelData.songID}`,
        `36:${levelData.extraString || ''}`,
        `37:${levelData.coins}`,
        `38:0`, // coin verified
        `39:${levelData.requestedStars || 0}`,
        `40:${levelData.isLDM}`,
        `42:0`, // epic
        `43:0`, // demon difficulty
        `45:${levelData.objects}`,
        `46:${levelData.wt || 0}`,
        `47:${levelData.wt2 || 0}`
      ].join(':');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error downloading level:', error);
      return '-1';
    }
  });
  
  // Get levels list
  fastify.post('/database/getGJLevels21.php', async (request, reply) => {
    const body = request.body as any;
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const str = body.str || '';
    const type = parseInt(body.type || '0');
    const offset = page * count;
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      let query = db.select().from(schema.levels);
      
      // Apply search filters
      if (str && type === 0) {
        // Search by name
        query = query.where(like(schema.levels.levelName, `%${str}%`));
      } else if (str && type === 1) {
        // Search by ID
        const levelID = parseInt(str);
        if (levelID) {
          query = query.where(eq(schema.levels.levelID, levelID));
        }
      } else if (str && type === 2) {
        // Search by user
        query = query.where(like(schema.levels.userName, `%${str}%`));
      }
      
      const levels = await query
        .limit(count)
        .offset(offset);
      
      if (!levels.length) {
        return '-1';
      }
      
      const levelStrings = levels.map(level => {
        return [
          `1:${level.levelID}`,
          `2:${level.levelName}`,
          `5:${level.levelVersion}`,
          `6:${level.userID}`,
          `8:10`, // difficulty  
          `9:${level.levelLength}`,
          `10:${level.objects}`,
          `12:${level.audioTrack}`,
          `13:${level.gameVersion}`,
          `14:${level.auto}`,
          `17:0`, // demons
          `19:${level.requestedStars}`,
          `25:${level.auto}`,
          `30:${level.original}`,
          `31:${level.twoPlayer}`,
          `35:${level.songID}`,
          `37:${level.coins}`,
          `38:0`, // coin verified
          `39:${level.requestedStars || 0}`,
          `42:0`, // epic
          `43:0`, // demon difficulty
          `45:${level.objects}`
        ].join(':');
      });
      
      const response = levelStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting levels:', error);
      return '-1';
    }
  });
  
  // Upload level
  fastify.post('/database/uploadGJLevel21.php', async (request, reply) => {
    const body = request.body as any;
    
    const levelName = body.levelName;
    const levelDesc = body.levelDesc;
    const levelString = body.levelString;
    const levelVersion = parseInt(body.levelVersion || '1');
    const levelLength = parseInt(body.levelLength || '0');
    const audioTrack = parseInt(body.audioTrack || '0');
    const auto = parseInt(body.auto || '0');
    const password = body.password;
    const original = parseInt(body.original || '0');
    const twoPlayer = parseInt(body.twoPlayer || '0');
    const songID = parseInt(body.songID || '0');
    const objects = parseInt(body.objects || '0');
    const coins = parseInt(body.coins || '0');
    const requestedStars = parseInt(body.requestedStars || '0');
    const extraString = body.extraString;
    const userID = parseInt(body.userID);
    const accountID = parseInt(body.accountID);
    const wt = parseInt(body.wt || '0');
    const wt2 = parseInt(body.wt2 || '0');
    const isLDM = parseInt(body.ldm || '0');
    
    if (!levelName || !levelString || !userID) {
      return '-1';
    }
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    // Check rate limit
    if (accountID) {
      const rateLimit = await checkRateLimit(fastify, gdpsId, accountID, 'levelUpload');
      if (!rateLimit.allowed) {
        return '-1'; // Rate limited
      }
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      const [result] = await db
        .insert(schema.levels)
        .values({
          levelName,
          levelDesc,
          levelString,
          levelVersion,
          levelLength,
          audioTrack,
          auto,
          password,
          original,
          twoPlayer,
          songID,
          objects,
          coins,
          requestedStars,
          extraString,
          userID,
          extID: accountID,
          userName: body.userName || 'Unknown',
          gameVersion: parseInt(body.gameVersion || '22'),
          binaryVersion: parseInt(body.binaryVersion || '35'),
          wt,
          wt2,
          isLDM,
          uploadDate: new Date(),
          updateDate: new Date()
        });
      
      return result.insertId.toString();
      
    } catch (error) {
      fastify.log.error('Error uploading level:', error);
      return '-1';
    }
  });
  
  // Update level description
  fastify.post('/database/updateGJDesc20.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    const levelDesc = body.levelDesc;
    const accountID = parseInt(body.accountID);
    
    if (!levelID || !accountID) {
      return '-1';
    }
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      const [result] = await db
        .update(schema.levels)
        .set({ 
          levelDesc,
          updateDate: new Date()
        })
        .where(and(
          eq(schema.levels.levelID, levelID),
          eq(schema.levels.extID, accountID)
        ));
      
      if (result.affectedRows === 0) {
        return '-1';
      }
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error updating level description:', error);
      return '-1';
    }
  });
  
  // Delete level
  fastify.post('/database/deleteGJLevelUser20.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    const accountID = parseInt(body.accountID);
    
    if (!levelID || !accountID) {
      return '-1';
    }
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      const [result] = await db
        .delete(schema.levels)
        .where(and(
          eq(schema.levels.levelID, levelID),
          eq(schema.levels.extID, accountID)
        ));
      
      if (result.affectedRows === 0) {
        return '-1';
      }
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error deleting level:', error);
      return '-1';
    }
  });
}