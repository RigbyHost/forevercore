import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface ChestConfig {
    minOrbs: number;
    maxOrbs: number;
    minDiamonds: number;
    maxDiamonds: number;
    items: number[];
    minKeys: number;
    maxKeys: number;
    wait: number;
}

interface ChestsYamlConfig {
    smallChest: ChestConfig;
    bigChest: ChestConfig;
}

let parsedYaml: ChestsYamlConfig = {
    smallChest: {
        minOrbs: 0,
        maxOrbs: 0,
        minDiamonds: 0,
        maxDiamonds: 0,
        items: [],
        minKeys: 0,
        maxKeys: 0,
        wait: 0
    },
    bigChest: {
        minOrbs: 0,
        maxOrbs: 0,
        minDiamonds: 0,
        maxDiamonds: 0,
        items: [],
        minKeys: 0,
        maxKeys: 0,
        wait: 0
    }
};

try {
    const yamlPath = path.join(__dirname, '../config/chests.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents) as ChestsYamlConfig;
} catch (error) {
    console.error("Error loading chest settings:", error);
}

export const smallChest = {
    minOrbs: parsedYaml.smallChest.minOrbs,
    maxOrbs: parsedYaml.smallChest.maxOrbs,
    minDiamonds: parsedYaml.smallChest.minDiamonds,
    maxDiamonds: parsedYaml.smallChest.maxDiamonds,
    items: parsedYaml.smallChest.items,
    minKeys: parsedYaml.smallChest.minKeys,
    maxKeys: parsedYaml.smallChest.maxKeys,
    wait: parsedYaml.smallChest.wait
};

export const bigChest = {
    minOrbs: parsedYaml.bigChest.minOrbs,
    maxOrbs: parsedYaml.bigChest.maxOrbs,
    minDiamonds: parsedYaml.bigChest.minDiamonds,
    maxDiamonds: parsedYaml.bigChest.maxDiamonds,
    items: parsedYaml.bigChest.items,
    minKeys: parsedYaml.bigChest.minKeys,
    maxKeys: parsedYaml.bigChest.maxKeys,
    wait: parsedYaml.bigChest.wait
};