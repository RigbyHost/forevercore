import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface ApiKeys {
	global_api_key: string, 
	api_keys: string[]
}

function loadApiKeys(id: string): ApiKeys {
    const defaultSettings: ApiKeys = {
        global_api_key: "", 
        api_keys: [""]
    };

    try {
        const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/apiKeys.yml`);
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(fileContents) as ApiKeys;
    } catch (error) {
        console.error(`Ошибка при загрузке конфигурации сервера для ID ${id}:`, error);
        return defaultSettings;
    }
}

export function getSettings(id: string): ApiKeys {
    return loadApiKeys(id);
}