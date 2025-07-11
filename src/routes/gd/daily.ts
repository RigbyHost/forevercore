import { FastifyInstance } from 'fastify';
import { eq, desc, and, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * Daily/Weekly content API endpoints - GD compatible
 */
export async function registerDailyRoutes(fastify: FastifyInstance) {
  
  // Get daily level
  fastify.post('/database/getGJDailyLevel.php', async (request, reply) => {
    const body = request.body as any;
    const weekly = parseInt(body.weekly || '0'); // 0=daily, 1=weekly
    
    try {
      // Get current daily/weekly level
      const feature = await fastify.db
        .select()
        .from(schema.dailyfeatures)
        .where(eq(schema.dailyfeatures.type, weekly))
        .orderBy(desc(schema.dailyfeatures.timestamp))
        .limit(1);
      
      if (!feature.length) {
        return '-1';
      }
      
      const featureData = feature[0];
      
      // Get the level data
      const level = await fastify.db
        .select()
        .from(schema.levels)
        .where(eq(schema.levels.levelID, featureData.levelID))
        .limit(1);
      
      if (!level.length) {
        return '-1';
      }
      
      const levelData = level[0];
      
      // Calculate time since feature (in seconds)
      const timeSince = Math.floor((Date.now() - new Date(featureData.timestamp).getTime()) / 1000);
      
      // Format response with daily/weekly specific data
      const response = [
        `1:${levelData.levelID}`,
        `2:${levelData.levelName}`,
        `5:${levelData.levelVersion}`,
        `6:${levelData.userID}`,
        `8:10`, // difficulty
        `9:${levelData.levelLength}`,
        `10:${levelData.objects}`,
        `12:${levelData.audioTrack}`,
        `13:${levelData.gameVersion}`,
        `14:${levelData.auto}`,
        `17:0`, // demons
        `19:${levelData.requestedStars}`,
        `25:${levelData.auto}`,
        `30:${levelData.original}`,
        `31:${levelData.twoPlayer}`,
        `35:${levelData.songID}`,
        `37:${levelData.coins}`,
        `38:0`, // coin verified
        `39:${levelData.requestedStars || 0}`,
        `41:${featureData.featureID}`, // daily ID
        `42:0`, // epic
        `43:0`, // demon difficulty
        `44:${featureData.coins || 0}`, // daily coins reward
        `45:${levelData.objects}`,
        `46:${levelData.wt || 0}`,
        `47:${levelData.wt2 || 0}`,
        `48:${timeSince}` // time since feature
      ].join(':');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting daily level:', error);
      return '-1';
    }
  });
  
  // Get gauntlets
  fastify.post('/database/getGJGauntlets21.php', async (request, reply) => {
    try {
      const gauntlets = await fastify.db
        .select()
        .from(schema.gauntlets);
      
      if (!gauntlets.length) {
        return '-1';
      }
      
      const gauntletStrings = gauntlets.map(gauntlet => {
        return [
          `1:${gauntlet.ID}`,
          `2:${gauntlet.level1}`,
          `3:${gauntlet.level2}`,
          `4:${gauntlet.level3}`,
          `5:${gauntlet.level4}`,
          `6:${gauntlet.level5}`
        ].join(':');
      });
      
      const response = gauntletStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting gauntlets:', error);
      return '-1';
    }
  });
  
  // Get map packs
  fastify.post('/database/getGJMapPacks21.php', async (request, reply) => {
    const body = request.body as any;
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const offset = page * count;
    
    try {
      const packs = await fastify.db
        .select()
        .from(schema.mappacks)
        .limit(count)
        .offset(offset);
      
      if (!packs.length) {
        return '-1';
      }
      
      const packStrings = packs.map(pack => {
        return [
          `1:${pack.ID}`,
          `2:${pack.name}`,
          `3:${pack.levels}`,
          `4:${pack.stars}`,
          `5:${pack.coins}`,
          `6:${pack.difficulty}`,
          `7:${pack.rgbcolors || ''}`,
          `8:${pack.colors2 || ''}`
        ].join(':');
      });
      
      const response = packStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting map packs:', error);
      return '-1';
    }
  });
  
  // Admin: Set daily level
  fastify.post('/database/setGJDailyLevel.php', async (request, reply) => {
    const body = request.body as any;
    const levelID = parseInt(body.levelID);
    const weekly = parseInt(body.weekly || '0');
    const coins = parseInt(body.coins || '0');
    const orbs = parseInt(body.orbs || '0');
    const diamonds = parseInt(body.diamonds || '0');
    
    if (!levelID) {
      return '-1';
    }
    
    try {
      // Verify level exists
      const level = await fastify.db
        .select()
        .from(schema.levels)
        .where(eq(schema.levels.levelID, levelID))
        .limit(1);
      
      if (!level.length) {
        return '-1';
      }
      
      // Insert new daily/weekly feature
      await fastify.db
        .insert(schema.dailyfeatures)
        .values({
          levelID,
          type: weekly,
          coins,
          orbs,
          diamonds,
          timestamp: new Date()
        });
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error setting daily level:', error);
      return '-1';
    }
  });
  
  // Get challenge list (for quests/challenges)
  fastify.post('/database/getGJChallenges.php', async (request, reply) => {
    try {
      // Return basic challenge structure
      // This would typically come from a challenges table
      const challenges = [
        {
          id: 1,
          type: 1, // level challenge
          goal: 3, // complete 3 levels
          reward: 200 // orbs
        },
        {
          id: 2,
          type: 2, // coin challenge  
          goal: 5, // collect 5 coins
          reward: 100 // orbs
        },
        {
          id: 3,
          type: 3, // star challenge
          goal: 10, // collect 10 stars
          reward: 500 // orbs
        }
      ];
      
      const challengeStrings = challenges.map(challenge => {
        return [
          `1:${challenge.id}`,
          `2:${challenge.type}`,
          `3:${challenge.goal}`,
          `4:${challenge.reward}`
        ].join(':');
      });
      
      const response = challengeStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting challenges:', error);
      return '-1';
    }
  });
  
  // Get rewards/chests
  fastify.post('/database/getGJRewards.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const chk = body.chk; // validation hash
    const udid = body.udid;
    const rewardType = parseInt(body.rewardType || '1'); // 1=small chest, 2=large chest
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      // Get user data to check chest timers
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, accountID))
        .limit(1);
      
      if (!user.length) {
        return '-1';
      }
      
      const userData = user[0];
      const now = Date.now();
      
      let canClaim = false;
      let timeLeft = 0;
      
      if (rewardType === 1) {
        // Small chest - every 4 hours
        const lastClaim = userData.chest1time || 0;
        const cooldown = 4 * 60 * 60 * 1000; // 4 hours in ms
        canClaim = (now - lastClaim) >= cooldown;
        timeLeft = Math.max(0, cooldown - (now - lastClaim));
      } else {
        // Large chest - every 24 hours  
        const lastClaim = userData.chest2time || 0;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours in ms
        canClaim = (now - lastClaim) >= cooldown;
        timeLeft = Math.max(0, cooldown - (now - lastClaim));
      }
      
      if (!canClaim) {
        // Return time left
        return Math.floor(timeLeft / 1000).toString();
      }
      
      // Generate random rewards
      const orbs = Math.floor(Math.random() * (rewardType === 1 ? 200 : 500)) + 50;
      const diamonds = Math.floor(Math.random() * (rewardType === 1 ? 5 : 15)) + 1;
      const shards = Math.floor(Math.random() * (rewardType === 1 ? 10 : 50)) + 5;
      
      // Update chest timer
      if (rewardType === 1) {
        await fastify.db
          .update(schema.users)
          .set({ 
            chest1time: now,
            chest1count: (userData.chest1count || 0) + 1
          })
          .where(eq(schema.users.extID, accountID));
      } else {
        await fastify.db
          .update(schema.users)
          .set({ 
            chest2time: now,
            chest2count: (userData.chest2count || 0) + 1
          })
          .where(eq(schema.users.extID, accountID));
      }
      
      // Return rewards in GD format
      const response = [
        `1:${orbs}`, // orbs
        `2:${diamonds}`, // diamonds
        `3:${shards}`, // fire shards
        `4:0`, // ice shards
        `5:0`, // poison shards
        `6:0`, // shadow shards
        `7:0`, // lava shards
        `8:0`, // demon keys
        `9:0` // bonus
      ].join(':');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting rewards:', error);
      return '-1';
    }
  });
}