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
exports.settings = void 0;
exports.getSettings = getSettings;
exports.getSettingsSync = getSettingsSync;
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const redis_config_1 = require("./redis-config");
function loadServerSettings(id) {
    const defaultSettings = {
        PORT: 3005, // уже не нужно 
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
        serverURL: 'http://localhost:3005',
        maxAccountBackups: 1
    };
    try {
        const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/settings.yml`);
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        return yaml.load(fileContents);
    }
    catch (error) {
        console.error(`Ошибка при загрузке конфигурации сервера для ID ${id}:`, error);
        return defaultSettings;
    }
}
async function getSettings(id) {
    try {
        // Try Redis first, fallback to file system
        return await (0, redis_config_1.getSettingsFromRedis)(id);
    }
    catch (error) {
        console.warn(`Redis settings failed for ${id}, falling back to file system:`, error);
        return loadServerSettings(id);
    }
}
// Synchronous version for backward compatibility
function getSettingsSync(id) {
    return loadServerSettings(id);
}
// For backward compatibility - uses 'main' as default GDPS ID
exports.settings = loadServerSettings('main');
