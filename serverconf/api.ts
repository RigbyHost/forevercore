import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface ApiConfig {
    getChallenges: string;
    getSongInfo: string;
    getZeMuInfo: string;
}

let parsedYaml: ApiConfig = {
    getChallenges: '',
    getSongInfo: '',
    getZeMuInfo: ''
};

try {
    const yamlPath = path.join(__dirname, '../config/api.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents) as ApiConfig;
} catch (error) {
    console.error("Error loading API settings:", error);
}

export const apiURL = {
    getChallenges: parsedYaml.getChallenges,
    getSongInfo: parsedYaml.getSongInfo,
    getZeMuInfo: parsedYaml.getZeMuInfo
};