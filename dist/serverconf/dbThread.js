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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const env_config_1 = __importDefault(require("./env-config"));
function createDBThread(id) {
    // Priority: Environment variables > YAML config > defaults
    // Try to get from environment first (recommended for production)
    const envHost = env_config_1.default.get('DB_HOST');
    const envUser = env_config_1.default.get('DB_USER');
    const envPassword = env_config_1.default.get('DB_PASSWORD');
    const envDatabase = env_config_1.default.get('DB_NAME');
    const envPort = env_config_1.default.get('DB_PORT');
    if (envHost && envUser && envDatabase) {
        // For multi-GDPS setup: use GDPS ID as database suffix
        // If DB_NAME is "gdps" and ID is "main", use "gdps_main"
        // If DB_NAME is "gdps" and ID is "0001", use "gdps_0001"
        const databaseName = id === 'main' ? envDatabase : `${envDatabase}_${id}`;
        return {
            host: envHost,
            user: envUser,
            password: envPassword,
            database: databaseName,
            port: envPort
        };
    }
    // Fallback to YAML config for backward compatibility
    const configPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/db.yml`);
    if (fs.existsSync(configPath)) {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        if (config.host && config.user && config.database) {
            return {
                host: config.host,
                user: config.user,
                password: config.password || envPassword,
                database: config.database,
                port: config.port || envPort
            };
        }
    }
    // Last resort: use environment variables with defaults
    return {
        host: envHost,
        user: envUser,
        password: envPassword,
        database: envDatabase,
        port: envPort
    };
}
exports.default = createDBThread;
