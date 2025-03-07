const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/music.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading music settings:", error);
}

const musicState = {
    zemu: parsedYaml.zemu
};

module.exports = musicState;
