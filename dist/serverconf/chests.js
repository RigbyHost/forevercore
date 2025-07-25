"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallChest = getSmallChest;
exports.getBigChest = getBigChest;
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadChestConfig(id) {
    const defaultConfig = {
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
        const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/chests.yml`);
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(fileContents);
    }
    catch (error) {
        console.error(`Ошибка при загрузке конфигурации сундуков для ID ${id}:`, error);
        return defaultConfig;
    }
}
/** Getting configuration for small chests from containers
 * @param id <string> container ID
 * @returns small chest config object
*/
function getSmallChest(id) {
    const parsedYaml = loadChestConfig(id);
    return parsedYaml.smallChest;
}
/** Getting configuration for small chests from containers
 * @param id <string> container ID
 * @returns small chest config object
*/
function getBigChest(id) {
    const parsedYaml = loadChestConfig(id);
    return parsedYaml.bigChest;
}
