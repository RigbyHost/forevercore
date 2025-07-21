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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const console_api_1 = __importDefault(require("../modules/console-api"));
class EnvironmentConfigManager {
    constructor() {
        this.config = this.loadEnvironmentConfig();
        this.validateConfig();
    }
    loadEnvironmentConfig() {
        // Load .env file if it exists
        this.loadDotEnvFile();
        const config = {
            // Server configuration
            PORT: this.getEnvAsNumber('PORT', 3010),
            NODE_ENV: this.getEnvAsString('NODE_ENV', 'development'),
            SERVER_URL: this.getEnvAsString('SERVER_URL', 'http://localhost:3010'),
            // Database configuration
            DB_HOST: this.getEnvAsString('DB_HOST', 'localhost'),
            DB_PORT: this.getEnvAsNumber('DB_PORT', 3306),
            DB_USER: this.getEnvAsString('DB_USER', 'gdps'),
            DB_PASSWORD: this.getEnvAsString('DB_PASSWORD', ''),
            DB_NAME: this.getEnvAsString('DB_NAME', 'gdps'),
            DB_CONNECTION_LIMIT: this.getEnvAsNumber('DB_CONNECTION_LIMIT', 10),
            // Redis configuration
            REDIS_ENABLED: this.getEnvAsBoolean('REDIS_ENABLED', false),
            REDIS_HOST: this.getEnvAsString('REDIS_HOST', 'localhost'),
            REDIS_PORT: this.getEnvAsNumber('REDIS_PORT', 6379),
            REDIS_PASSWORD: this.getEnvAsString('REDIS_PASSWORD'),
            REDIS_DATABASE: this.getEnvAsNumber('REDIS_DATABASE', 0),
            // Security
            GJP_SECRET: this.getEnvAsString('GJP_SECRET', this.generateRandomSecret()),
            XOR_KEY: this.getEnvAsString('XOR_KEY', this.generateRandomSecret()),
            CAPTCHA_SECRET: this.getEnvAsString('CAPTCHA_SECRET'),
            // External services
            YOUTUBE_API_KEY: this.getEnvAsString('YOUTUBE_API_KEY'),
            AWS_ACCESS_KEY_ID: this.getEnvAsString('AWS_ACCESS_KEY_ID'),
            AWS_SECRET_ACCESS_KEY: this.getEnvAsString('AWS_SECRET_ACCESS_KEY'),
            AWS_REGION: this.getEnvAsString('AWS_REGION', 'us-east-1'),
            AWS_S3_BUCKET: this.getEnvAsString('AWS_S3_BUCKET'),
            // GDPS specific
            GDPS_NAME: this.getEnvAsString('GDPS_NAME', 'ForeverCore GDPS'),
            GDPS_ID: this.getEnvAsString('GDPS_ID', 'main'),
            ADMIN_EMAIL: this.getEnvAsString('ADMIN_EMAIL', 'admin@gdps.local'),
            DEFAULT_ADMIN_USERNAME: this.getEnvAsString('DEFAULT_ADMIN_USERNAME', 'admin'),
            DEFAULT_ADMIN_PASSWORD: this.getEnvAsString('DEFAULT_ADMIN_PASSWORD', 'admin123'),
            // Features
            ENABLE_REGISTRATION: this.getEnvAsBoolean('ENABLE_REGISTRATION', true),
            ENABLE_LEVEL_UPLOADS: this.getEnvAsBoolean('ENABLE_LEVEL_UPLOADS', true),
            ENABLE_COMMENTS: this.getEnvAsBoolean('ENABLE_COMMENTS', true),
            ENABLE_MUSIC_UPLOADS: this.getEnvAsBoolean('ENABLE_MUSIC_UPLOADS', true),
            // Logging
            LOG_LEVEL: this.getEnvAsString('LOG_LEVEL', 'info'),
            LOG_TO_FILE: this.getEnvAsBoolean('LOG_TO_FILE', true),
            // Performance
            MAX_UPLOAD_SIZE: this.getEnvAsString('MAX_UPLOAD_SIZE', '50mb'),
            REQUEST_TIMEOUT: this.getEnvAsNumber('REQUEST_TIMEOUT', 30000),
            RATE_LIMIT_WINDOW: this.getEnvAsNumber('RATE_LIMIT_WINDOW', 900000), // 15 minutes
            RATE_LIMIT_MAX_REQUESTS: this.getEnvAsNumber('RATE_LIMIT_MAX_REQUESTS', 100)
        };
        return config;
    }
    loadDotEnvFile() {
        const envPath = path.join(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            try {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const lines = envContent.split('\n');
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.startsWith('#')) {
                        const [key, ...valueParts] = trimmedLine.split('=');
                        if (key && valueParts.length > 0) {
                            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                            process.env[key.trim()] = value;
                        }
                    }
                }
                console_api_1.default.Log('EnvConfig', 'Loaded .env file successfully');
            }
            catch (error) {
                console_api_1.default.Warn('EnvConfig', `Failed to load .env file: ${error}`);
            }
        }
    }
    getEnvAsString(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        return value;
    }
    getEnvAsNumber(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
        }
        return parsed;
    }
    getEnvAsBoolean(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        return value.toLowerCase() === 'true' || value === '1';
    }
    generateRandomSecret() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
    validateConfig() {
        // Validate critical configurations
        if (!this.config.DB_PASSWORD && this.config.NODE_ENV === 'production') {
            console_api_1.default.Warn('EnvConfig', 'Database password is not set in production environment');
        }
        if (this.config.GJP_SECRET.length < 16) {
            console_api_1.default.Warn('EnvConfig', 'GJP secret should be at least 16 characters long');
        }
        if (this.config.REDIS_ENABLED && !this.config.REDIS_HOST) {
            throw new Error('Redis is enabled but REDIS_HOST is not configured');
        }
        console_api_1.default.Log('EnvConfig', 'Environment configuration validated successfully');
    }
    getConfig() {
        return { ...this.config };
    }
    get(key) {
        return this.config[key];
    }
    isDevelopment() {
        return this.config.NODE_ENV === 'development';
    }
    isProduction() {
        return this.config.NODE_ENV === 'production';
    }
    isTest() {
        return this.config.NODE_ENV === 'test';
    }
    logConfiguration() {
        if (this.isDevelopment()) {
            const safeConfig = { ...this.config };
            // Hide sensitive information
            safeConfig.DB_PASSWORD = '***';
            safeConfig.GJP_SECRET = '***';
            safeConfig.XOR_KEY = '***';
            safeConfig.REDIS_PASSWORD = safeConfig.REDIS_PASSWORD ? '***' : undefined;
            console_api_1.default.Log('EnvConfig', 'Current configuration:');
            console.table(safeConfig);
        }
    }
}
// Singleton instance
const envConfigManager = new EnvironmentConfigManager();
exports.default = envConfigManager;
