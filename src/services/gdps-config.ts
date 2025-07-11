import { FastifyInstance } from 'fastify';

export interface GdpsConfig {
  // Basic settings
  name: string;
  description: string;
  domain?: string;
  
  // Game settings
  gameVersion: number;
  binaryVersion: number;
  
  // Chest rewards
  chests: {
    small: {
      cooldown: number; // hours
      rewards: {
        orbs: { min: number; max: number };
        diamonds: { min: number; max: number };
        shards: { min: number; max: number };
      };
    };
    large: {
      cooldown: number; // hours
      rewards: {
        orbs: { min: number; max: number };
        diamonds: { min: number; max: number };
        shards: { min: number; max: number };
        keys: { min: number; max: number };
      };
    };
  };
  
  // Daily/Weekly settings
  daily: {
    enabled: boolean;
    autoRotate: boolean;
    rotateHour: number; // 0-23
    rewards: {
      coins: number;
      orbs: number;
      diamonds: number;
    };
  };
  
  weekly: {
    enabled: boolean;
    autoRotate: boolean;
    rotateDay: number; // 0-6 (Sunday-Saturday)
    rewards: {
      coins: number;
      orbs: number;
      diamonds: number;
    };
  };
  
  // Rate limits
  rateLimits: {
    levelUpload: { count: number; window: number }; // per hour
    commentUpload: { count: number; window: number }; // per hour
    friendRequests: { count: number; window: number }; // per day
  };
  
  // Moderation
  moderation: {
    autoModEnabled: boolean;
    profanityFilter: boolean;
    spamDetection: boolean;
    requireApproval: {
      levels: boolean;
      comments: boolean;
    };
  };
  
  // Features
  features: {
    customSongs: boolean;
    levelLists: boolean;
    messaging: boolean;
    leaderboards: boolean;
    gauntlets: boolean;
    mapPacks: boolean;
  };
}

const defaultConfig: GdpsConfig = {
  name: 'My GDPS',
  description: 'A Geometry Dash Private Server',
  gameVersion: 22,
  binaryVersion: 35,
  
  chests: {
    small: {
      cooldown: 4, // 4 hours
      rewards: {
        orbs: { min: 50, max: 200 },
        diamonds: { min: 1, max: 5 },
        shards: { min: 5, max: 15 }
      }
    },
    large: {
      cooldown: 24, // 24 hours
      rewards: {
        orbs: { min: 200, max: 500 },
        diamonds: { min: 5, max: 15 },
        shards: { min: 20, max: 50 },
        keys: { min: 1, max: 3 }
      }
    }
  },
  
  daily: {
    enabled: true,
    autoRotate: true,
    rotateHour: 0, // midnight UTC
    rewards: {
      coins: 200,
      orbs: 500,
      diamonds: 10
    }
  },
  
  weekly: {
    enabled: true,
    autoRotate: true,
    rotateDay: 1, // Monday
    rewards: {
      coins: 1000,
      orbs: 2000,
      diamonds: 50
    }
  },
  
  rateLimits: {
    levelUpload: { count: 10, window: 3600 }, // 10 per hour
    commentUpload: { count: 30, window: 3600 }, // 30 per hour
    friendRequests: { count: 20, window: 86400 } // 20 per day
  },
  
  moderation: {
    autoModEnabled: false,
    profanityFilter: true,
    spamDetection: true,
    requireApproval: {
      levels: false,
      comments: false
    }
  },
  
  features: {
    customSongs: true,
    levelLists: true,
    messaging: true,
    leaderboards: true,
    gauntlets: true,
    mapPacks: true
  }
};

/**
 * Get GDPS configuration from Redis
 */
export async function getGdpsConfig(fastify: FastifyInstance, gdpsId: string): Promise<GdpsConfig> {
  try {
    const configKey = `gdps:${gdpsId}:config`;
    const config = await fastify.redis.get(configKey);
    
    if (config) {
      return { ...defaultConfig, ...JSON.parse(config) };
    }
    
    // Return default config if none exists
    return defaultConfig;
  } catch (error) {
    fastify.log.error(`Error getting config for GDPS ${gdpsId}:`, error);
    return defaultConfig;
  }
}

/**
 * Set GDPS configuration in Redis
 */
export async function setGdpsConfig(fastify: FastifyInstance, gdpsId: string, config: Partial<GdpsConfig>): Promise<boolean> {
  try {
    const configKey = `gdps:${gdpsId}:config`;
    const currentConfig = await getGdpsConfig(fastify, gdpsId);
    const updatedConfig = { ...currentConfig, ...config };
    
    await fastify.redis.set(configKey, JSON.stringify(updatedConfig));
    return true;
  } catch (error) {
    fastify.log.error(`Error setting config for GDPS ${gdpsId}:`, error);
    return false;
  }
}

/**
 * Delete GDPS configuration from Redis
 */
export async function deleteGdpsConfig(fastify: FastifyInstance, gdpsId: string): Promise<boolean> {
  try {
    const pattern = `gdps:${gdpsId}:*`;
    const keys = await fastify.redis.keys(pattern);
    
    if (keys.length > 0) {
      await fastify.redis.del(...keys);
    }
    
    return true;
  } catch (error) {
    fastify.log.error(`Error deleting config for GDPS ${gdpsId}:`, error);
    return false;
  }
}

/**
 * Get chest reward configuration
 */
export async function getChestConfig(fastify: FastifyInstance, gdpsId: string, chestType: 'small' | 'large') {
  const config = await getGdpsConfig(fastify, gdpsId);
  return config.chests[chestType];
}

/**
 * Check rate limit for user action
 */
export async function checkRateLimit(
  fastify: FastifyInstance, 
  gdpsId: string, 
  userId: number, 
  action: keyof GdpsConfig['rateLimits']
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const config = await getGdpsConfig(fastify, gdpsId);
    const limit = config.rateLimits[action];
    
    const key = `ratelimit:${gdpsId}:${action}:${userId}`;
    const current = await fastify.redis.get(key);
    const count = current ? parseInt(current) : 0;
    
    if (count >= limit.count) {
      const ttl = await fastify.redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (ttl * 1000)
      };
    }
    
    // Increment counter
    if (count === 0) {
      await fastify.redis.setex(key, limit.window, '1');
    } else {
      await fastify.redis.incr(key);
    }
    
    const ttl = await fastify.redis.ttl(key);
    return {
      allowed: true,
      remaining: limit.count - count - 1,
      resetTime: Date.now() + (ttl * 1000)
    };
    
  } catch (error) {
    fastify.log.error(`Error checking rate limit for ${action}:`, error);
    return { allowed: true, remaining: 0, resetTime: 0 };
  }
}