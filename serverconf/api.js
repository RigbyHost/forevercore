const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/api.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading API settings:", error);
}

const apiURL = {
    getChallenges: parsedYaml.getChallenges,
    getSongInfo: parsedYaml.getSongInfo,
    getZeMuInfo: parsedYaml.getZeMuInfo
};

module.exports = apiURL;