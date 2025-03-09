import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

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
    maxAccountBackups: number; // Максимальное количество бэкапов для каждого аккаунта
}

let parsedYaml: ServerSettings = {
    PORT: 3005,
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
    serverURL: 'http://localhost:3005'
    topCount: 100
};

try {
    const yamlPath = path.join(__dirname, '../config/settings.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents) as ServerSettings;
} catch (error) {
    console.error("Error loading settings:", error);
}

export const settings: ServerSettings = {
    PORT: parsedYaml.PORT,
    serverName: parsedYaml.serverName,
    GDPSID: parsedYaml.GDPSID,
    NodeName: parsedYaml.NodeName,
    sessionGrants: parsedYaml.sessionGrants,
    unregisteredSubmissions: parsedYaml.unregisteredSubmissions,
    topCount: parsedYaml.topCount,
    objectLimitFU: parsedYaml.objectLimitFU,
    objectLimitCount: parsedYaml.objectLimitCount,
    diffVote: parsedYaml.diffVote,
    diffVoteLevel: parsedYaml.diffVoteLevel,
    hardDiffVote: parsedYaml.hardDiffVote,
    serverURL: parsedYaml.serverURL
};
