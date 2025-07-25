import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { getSettingsFromRedis } from './redis-config';

interface ServerSettings {
    PORT: number; // уже не нужно
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
    maxAccountBackups: number; // Максимальное количество бэкапов для каждого аккаунта
}

function loadServerSettings(id: string): ServerSettings {
    const defaultSettings: ServerSettings = {
        PORT: 3005, // уже не нужно 
        serverName: 'GDPS',
        GDPSID: '',
        NodeName: 'n01',
        sessionGrants: false,
        unregisteredSubmissions: false,
        topCount: 100,
        objectLimitFU: true,
        objectLimitCount: 100,
        diffVote: true,
        diffVoteLevel: 3,
        hardDiffVote: false,
        serverURL: 'http://localhost:3005', 
        maxAccountBackups: 1
    };

    try {
        const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/settings.yml`);
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(fileContents) as ServerSettings;
    } catch (error) {
        console.error(`Ошибка при загрузке конфигурации сервера для ID ${id}:`, error);
        return defaultSettings;
    }
}

export async function getSettings(id: string): Promise<ServerSettings> {
    try {
        // Try Redis first, fallback to file system
        return await getSettingsFromRedis(id);
    } catch (error) {
        console.warn(`Redis settings failed for ${id}, falling back to file system:`, error);
        return loadServerSettings(id);
    }
}

// Synchronous version for backward compatibility
export function getSettingsSync(id: string): ServerSettings {
    return loadServerSettings(id);
}

// For backward compatibility - uses 'main' as default GDPS ID
export const settings = loadServerSettings('main');