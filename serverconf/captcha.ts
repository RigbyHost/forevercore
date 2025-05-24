import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface CaptchaConfig {
    key: string;
    secret: string;
}

let parsedYaml: CaptchaConfig = {
    key: '',
    secret: ''
};

try {
    const yamlPath = path.join(__dirname, '../config/captcha.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents) as CaptchaConfig;
} catch (error) {
    console.error("Error loading CAPTCHA settings:", error);
}

export const captcha = {
    key: parsedYaml.key,
    secret: parsedYaml.secret
};