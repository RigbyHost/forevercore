const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/captcha.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading CAPTCHA settings:", error);
}

const captcha = {
    key: parsedYaml.key,
    secret: parsedYaml.secret
};

module.exports = captcha;
