"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfigManager = void 0;
exports.getSettingsFromRedis = getSettingsFromRedis;
exports.invalidateSettingsCache = invalidateSettingsCache;
const redis_1 = require("redis");
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const console_api_1 = __importDefault(require("../modules/console-api"));
class RedisConfigManager {
    constructor() {
        this.client = null;
        this.connected = false;
        this.config = this.loadRedisConfig();
        if (this.config.enabled) {
            this.initializeClient();
        }
    }
    loadRedisConfig() {
        const defaultConfig = {
            host: 'localhost',
            port: 6379,
            enabled: false
        };
        // Priority: Environment variables > YAML config > defaults
        const envHost = process.env.REDIS_HOST;
        const envPort = process.env.REDIS_PORT;
        const envPassword = process.env.REDIS_PASSWORD;
        const envDatabase = process.env.REDIS_DATABASE;
        const envEnabled = process.env.REDIS_ENABLED;
        if (envHost && envPort) {
            return {
                host: envHost,
                port: parseInt(envPort, 10),
                password: envPassword,
                database: envDatabase ? parseInt(envDatabase, 10) : undefined,
                enabled: envEnabled === 'true'
            };
        }
        // Fallback to YAML config for backward compatibility
        try {
            const configPath = path.join(__dirname, '../config/redis.yml');
            if (fs.existsSync(configPath)) {
                const fileContents = fs.readFileSync(configPath, 'utf8');
                const yamlConfig = yaml.load(fileContents);
                return {
                    ...defaultConfig,
                    ...yamlConfig,
                    // Allow env override of password and enabled status
                    password: envPassword || yamlConfig.password,
                    enabled: envEnabled === 'true' || yamlConfig.enabled
                };
            }
        }
        catch (error) {
            console_api_1.default.Warn('RedisConfig', `Failed to load Redis config: ${error}`);
        }
        return defaultConfig;
    }
    async initializeClient() {
        try {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host: this.config.host,
                    port: this.config.port
                },
                password: this.config.password,
                database: this.config.database || 0
            });
            this.client.on('error', (err) => {
                console_api_1.default.Error('RedisConfig', `Redis client error: ${err}`);
                this.connected = false;
            });
            this.client.on('connect', () => {
                console_api_1.default.Log('RedisConfig', 'Connected to Redis server');
                this.connected = true;
            });
            await this.client.connect();
        }
        catch (error) {
            console_api_1.default.Error('RedisConfig', `Failed to connect to Redis: ${error}`);
            this.connected = false;
            this.client = null;
        }
    }
    async getSettings(gdpsId) {
        const cacheKey = `gdps:${gdpsId}:settings`;
        // Try to get from Redis first
        if (this.connected && this.client) {
            try {
                const cached = await this.client.get(cacheKey);
                if (cached && typeof cached === 'string') {
                    console_api_1.default.Debug('RedisConfig', `Settings loaded from cache for ${gdpsId}`);
                    return JSON.parse(cached);
                }
            }
            catch (error) {
                console_api_1.default.Warn('RedisConfig', `Failed to get settings from Redis: ${error}`);
            }
        }
        // Fallback to file system
        const settings = this.loadSettingsFromFile(gdpsId);
        // Cache in Redis for future use
        if (this.connected && this.client) {
            try {
                await this.client.setEx(cacheKey, 300, JSON.stringify(settings)); // Cache for 5 minutes
                console_api_1.default.Debug('RedisConfig', `Settings cached for ${gdpsId}`);
            }
            catch (error) {
                console_api_1.default.Warn('RedisConfig', `Failed to cache settings in Redis: ${error}`);
            }
        }
        return settings;
    }
    loadSettingsFromFile(gdpsId) {
        const defaultSettings = {
            PORT: 3010,
            serverName: 'GDPS',
            GDPSID: gdpsId,
            NodeName: 'n01',
            sessionGrants: false,
            unregisteredSubmissions: false,
            topCount: 100,
            objectLimitFU: true,
            objectLimitCount: 100,
            diffVote: true,
            diffVoteLevel: 3,
            hardDiffVote: false,
            serverURL: 'http://localhost:3010',
            maxAccountBackups: 1
        };
        try {
            const yamlPath = path.join(__dirname, `../GDPS_DATA/${gdpsId}/data/config/settings.yml`);
            const fileContents = fs.readFileSync(yamlPath, 'utf8');
            const loadedSettings = yaml.load(fileContents);
            return { ...defaultSettings, ...loadedSettings };
        }
        catch (error) {
            console_api_1.default.Warn('RedisConfig', `Failed to load settings from file for ${gdpsId}: ${error}`);
            return defaultSettings;
        }
    }
    async invalidateCache(gdpsId) {
        if (this.connected && this.client) {
            try {
                await this.client.del(`gdps:${gdpsId}:settings`);
                console_api_1.default.Log('RedisConfig', `Cache invalidated for ${gdpsId}`);
            }
            catch (error) {
                console_api_1.default.Warn('RedisConfig', `Failed to invalidate cache: ${error}`);
            }
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.connected = false;
            console_api_1.default.Log('RedisConfig', 'Disconnected from Redis');
        }
    }
}
exports.RedisConfigManager = RedisConfigManager;
// Singleton instance
const redisConfigManager = new RedisConfigManager();
async function getSettingsFromRedis(gdpsId) {
    return await redisConfigManager.getSettings(gdpsId);
}
async function invalidateSettingsCache(gdpsId) {
    return await redisConfigManager.invalidateCache(gdpsId);
}
exports.default = redisConfigManager;
