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
    private clients: Map<string, RedisClientType> = new Map();
    private config: RedisConfig;

    constructor() {
        this.config = this.loadRedisConfig();
    }

    private loadRedisConfig(): RedisConfig {
        const defaultConfig: RedisConfig = {
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
                const yamlConfig = yaml.load(fileContents) as RedisConfig;
                return { 
                    ...defaultConfig, 
                    ...yamlConfig,
                    // Allow env override of password and enabled status
                    password: envPassword || yamlConfig.password,
                    enabled: envEnabled === 'true' || yamlConfig.enabled
                };
            }
        } catch (error) {
            ConsoleApi.Warn('RedisConfig', `Failed to load Redis config: ${error}`);
        }

        return defaultConfig;
    }

    private async getClientForGdps(gdpsId: string): Promise<RedisClientType | null> {
        if (!this.config.enabled) {
            return null;
        }

        if (this.clients.has(gdpsId)) {
            return this.clients.get(gdpsId)!;
        }

        try {
            // Calculate Redis database number based on GDPS ID
            // main = 0, 0001 = 1, 0002 = 2, etc.
            let databaseNumber = 0;
            if (gdpsId !== 'main') {
                const numericId = parseInt(gdpsId, 10);
                if (!isNaN(numericId)) {
                    databaseNumber = numericId % 16; // Redis has 16 databases (0-15)
                }
            }

            const client = createClient({
                socket: {
                    host: this.config.host,
                    port: this.config.port
                },
                password: this.config.password,
                database: databaseNumber
            });

            client.on('error', (err) => {
                ConsoleApi.Error('RedisConfig', `Redis client error for ${gdpsId}: ${err}`);
                this.clients.delete(gdpsId);
            });

            client.on('connect', () => {
                ConsoleApi.Log('RedisConfig', `Connected to Redis server for ${gdpsId} (db: ${databaseNumber})`);
            });

            await client.connect();
            this.clients.set(gdpsId, client);
            return client;
        } catch (error) {
            ConsoleApi.Error('RedisConfig', `Failed to connect to Redis for ${gdpsId}: ${error}`);
            return null;
        }
    }

    async getSettings(gdpsId: string): Promise<ServerSettings> {
        const cacheKey = `gdps:${gdpsId}:settings`;
        
        // Try to get from Redis first
        const client = await this.getClientForGdps(gdpsId);
        if (client) {
            try {
                const cached = await client.get(cacheKey);
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
        if (client) {
            try {
                await client.setEx(cacheKey, 300, JSON.stringify(settings)); // Cache for 5 minutes
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
        const client = await this.getClientForGdps(gdpsId);
        if (client) {
            try {
                await client.del(`gdps:${gdpsId}:settings`);
                ConsoleApi.Log('RedisConfig', `Cache invalidated for ${gdpsId}`);
            } catch (error) {
                ConsoleApi.Warn('RedisConfig', `Failed to invalidate cache: ${error}`);
            }
        }
    }

    async disconnect(): Promise<void> {
        for (const [gdpsId, client] of this.clients) {
            try {
                await client.disconnect();
                ConsoleApi.Log('RedisConfig', `Disconnected from Redis for ${gdpsId}`);
            } catch (error) {
                ConsoleApi.Warn('RedisConfig', `Failed to disconnect Redis client for ${gdpsId}: ${error}`);
            }
        }
        this.clients.clear();
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