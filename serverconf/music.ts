import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface MusicConfig {
    zemu: boolean;
}

// Функция для загрузки конфигурации музыки
function loadMusicConfig(id: string): MusicConfig {
    const defaultConfig: MusicConfig = {
        zemu: false
    };

    try {
        const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/music.yml`);
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(fileContents) as MusicConfig;
    } catch (error) {
        console.error(`Ошибка при загрузке конфигурации музыки для ID ${id}:`, error);
        return defaultConfig;
    }
}

export function getMusicState(id: string): MusicConfig {
    return loadMusicConfig(id);
} 