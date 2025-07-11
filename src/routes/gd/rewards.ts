import { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { extractGdpsId } from '../../utils/gdps-middleware.js';
import { getChestConfig } from '../../services/gdps-config.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * Rewards and chests API - using GDPS configs from Redis
 */
export async function registerRewardsRoutes(fastify: FastifyInstance) {
  
  // Get chest rewards
  fastify.post('/database/getGJRewards.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const rewardType = parseInt(body.rewardType || '1'); // 1=small, 2=large
    
    if (!accountID) {
      return '-1';
    }
    
    const gdpsId = await extractGdpsId(request);
    if (!gdpsId) {
      return '-1';
    }
    
    const db = fastify.getGdpsDb(gdpsId);
    
    try {
      // Get chest config from Redis
      const chestType = rewardType === 1 ? 'small' : 'large';
      const chestConfig = await getChestConfig(fastify, gdpsId, chestType);
      
      // Get user data to check chest timers
      const user = await db
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
      
      const cooldown = chestConfig.cooldown * 60 * 60 * 1000; // hours to ms
      
      if (rewardType === 1) {
        const lastClaim = userData.chest1time || 0;
        canClaim = (now - lastClaim) >= cooldown;
        timeLeft = Math.max(0, cooldown - (now - lastClaim));
      } else {
        const lastClaim = userData.chest2time || 0;
        canClaim = (now - lastClaim) >= cooldown;
        timeLeft = Math.max(0, cooldown - (now - lastClaim));
      }
      
      if (!canClaim) {
        // Return time left in seconds
        return Math.floor(timeLeft / 1000).toString();
      }
      
      // Generate random rewards based on config
      const rewards = chestConfig.rewards;
      const orbs = Math.floor(Math.random() * (rewards.orbs.max - rewards.orbs.min + 1)) + rewards.orbs.min;
      const diamonds = Math.floor(Math.random() * (rewards.diamonds.max - rewards.diamonds.min + 1)) + rewards.diamonds.min;
      const shards = Math.floor(Math.random() * (rewards.shards.max - rewards.shards.min + 1)) + rewards.shards.min;
      
      let keys = 0;
      if (chestType === 'large' && rewards.keys) {
        keys = Math.floor(Math.random() * (rewards.keys.max - rewards.keys.min + 1)) + rewards.keys.min;
      }
      
      // Update chest timer and user resources
      const updateData: any = {
        diamonds: sql`${schema.users.diamonds} + ${diamonds}`
      };
      
      if (rewardType === 1) {
        updateData.chest1time = now;
        updateData.chest1count = sql`${schema.users.chest1count} + 1`;
      } else {
        updateData.chest2time = now;
        updateData.chest2count = sql`${schema.users.chest2count} + 1`;
      }
      
      await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.extID, accountID));
      
      // Return rewards in GD format
      const response = [
        `1:${orbs}`, // orbs
        `2:${diamonds}`, // diamonds
        `3:${shards}`, // fire shards
        `4:0`, // ice shards
        `5:0`, // poison shards
        `6:0`, // shadow shards
        `7:0`, // lava shards
        `8:${keys}`, // demon keys
        `9:0` // bonus
      ].join(':');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting rewards:', error);
      return '-1';
    }
  });
}