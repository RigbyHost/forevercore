const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/settings.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading settings:", error);
}

const settings = {
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

module.exports = settings;
