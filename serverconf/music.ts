import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface MusicConfig {
    zemu: boolean;
}

let parsedYaml: MusicConfig = {
    zemu: false
};

try {
    const yamlPath = path.join(__dirname, '../config/music.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents) as MusicConfig;
} catch (error) {
    console.error("Error loading music settings:", error);
}

export const musicState = {
    zemu: parsedYaml.zemu
};