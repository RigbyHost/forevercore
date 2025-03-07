const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

let parsedYaml = {};

try {
    const yamlPath = path.join(__dirname, '../config/chests.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    console.error("Error loading chest settings:", error);
}

const smallChest = {
    minOrbs: parsedYaml.smallChest.minOrbs,
    maxOrbs: parsedYaml.smallChest.maxOrbs,
    minDiamonds: parsedYaml.smallChest.minDiamonds,
    maxDiamonds: parsedYaml.smallChest.maxDiamonds,
    items: parsedYaml.smallChest.items,
    minKeys: parsedYaml.smallChest.minKeys,
    maxKeys: parsedYaml.smallChest.maxKeys,
    wait: parsedYaml.smallChest.wait
};

const bigChest = {
    minOrbs: parsedYaml.bigChest.minOrbs,
    maxOrbs: parsedYaml.bigChest.maxOrbs,
    minDiamonds: parsedYaml.bigChest.minDiamonds,
    maxDiamonds: parsedYaml.bigChest.maxDiamonds,
    items: parsedYaml.bigChest.items,
    minKeys: parsedYaml.bigChest.minKeys,
    maxKeys: parsedYaml.bigChest.maxKeys,
    wait: parsedYaml.bigChest.wait
};

module.exports = { smallChest, bigChest };