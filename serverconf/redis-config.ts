import { createClient, RedisClientType } from 'redis';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import ConsoleApi from '../modules/console-api';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    database?: number;
    enabled: boolean;
}

interface ServerSettings {
    PORT: number;
    serverName: string;
    GDPSID: string;
    NodeName: string;
    topCount: number;
    objectLimitFU: boolean;
    objectLimitCount: number;
    diffVote: boolean;
    diffVoteLevel: number;
    hardDiffVote: boolean;
    serverURL: string;
    sessionGrants: boolean;
    unregisteredSubmissions: boolean;
    maxAccountBackups: number;
}

class RedisConfigManager {
    private client: RedisClientType | null = null;
    private connected = false;
    private config: RedisConfig;

    constructor() {
        this.config = this.loadRedisConfig();
        if (this.config.enabled) {
            this.initializeClient();
        }
    }

    private loadRedisConfig(): RedisConfig {
        const defaultConfig: RedisConfig = {
            host: 'localhost',
            port: 6379,
            enabled: false
        };

        try {
            const configPath = path.join(__dirname, '../config/redis.yml');
            if (fs.existsSync(configPath)) {
                const fileContents = fs.readFileSync(configPath, 'utf8');
                return { ...defaultConfig, ...yaml.load(fileContents) as RedisConfig };
            }
        } catch (error) {
            ConsoleApi.Warn('RedisConfig', `Failed to load Redis config: ${error}`);
        }

        return defaultConfig;
    }

    private async initializeClient(): Promise<void> {
        try {
            this.client = createClient({
                socket: {
                    host: this.config.host,
                    port: this.config.port
                },
                password: this.config.password,
                database: this.config.database || 0
            });

            this.client.on('error', (err) => {
                ConsoleApi.Error('RedisConfig', `Redis client error: ${err}`);
                this.connected = false;
            });

            this.client.on('connect', () => {
                ConsoleApi.Log('RedisConfig', 'Connected to Redis server');
                this.connected = true;
            });

            await this.client.connect();
        } catch (error) {
            ConsoleApi.Error('RedisConfig', `Failed to connect to Redis: ${error}`);
            this.connected = false;
            this.client = null;
        }
    }

    async getSettings(gdpsId: string): Promise<ServerSettings> {
        const cacheKey = `gdps:${gdpsId}:settings`;
        
        // Try to get from Redis first
        if (this.connected && this.client) {
            try {
                const cached = await this.client.get(cacheKey);
                if (cached) {
                    ConsoleApi.Debug('RedisConfig', `Settings loaded from cache for ${gdpsId}`);
                    return JSON.parse(cached) as ServerSettings;
                }
            } catch (error) {
                ConsoleApi.Warn('RedisConfig', `Failed to get settings from Redis: ${error}`);
            }
        }

        // Fallback to file system
        const settings = this.loadSettingsFromFile(gdpsId);

        // Cache in Redis for future use
        if (this.connected && this.client) {
            try {
                await this.client.setEx(cacheKey, 300, JSON.stringify(settings)); // Cache for 5 minutes
                ConsoleApi.Debug('RedisConfig', `Settings cached for ${gdpsId}`);
            } catch (error) {
                ConsoleApi.Warn('RedisConfig', `Failed to cache settings in Redis: ${error}`);
            }
        }

        return settings;
    }

    private loadSettingsFromFile(gdpsId: string): ServerSettings {
        const defaultSettings: ServerSettings = {
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
            const loadedSettings = yaml.load(fileContents) as Partial<ServerSettings>;
            return { ...defaultSettings, ...loadedSettings };
        } catch (error) {
            ConsoleApi.Warn('RedisConfig', `Failed to load settings from file for ${gdpsId}: ${error}`);
            return defaultSettings;
        }
    }

    async invalidateCache(gdpsId: string): Promise<void> {
        if (this.connected && this.client) {
            try {
                await this.client.del(`gdps:${gdpsId}:settings`);
                ConsoleApi.Log('RedisConfig', `Cache invalidated for ${gdpsId}`);
            } catch (error) {
                ConsoleApi.Warn('RedisConfig', `Failed to invalidate cache: ${error}`);
            }
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.disconnect();
            this.connected = false;
            ConsoleApi.Log('RedisConfig', 'Disconnected from Redis');
        }
    }
}

// Singleton instance
const redisConfigManager = new RedisConfigManager();

export async function getSettingsFromRedis(gdpsId: string): Promise<ServerSettings> {
    return await redisConfigManager.getSettings(gdpsId);
}

export async function invalidateSettingsCache(gdpsId: string): Promise<void> {
    return await redisConfigManager.invalidateCache(gdpsId);
}

export { RedisConfigManager };
export default redisConfigManager;