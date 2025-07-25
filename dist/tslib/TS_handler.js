'package net.fimastgd.forevercore.tslib.TS_handler';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const console_api_1 = __importDefault(require("../modules/console-api"));
const db_proxy_1 = __importDefault(require("../serverconf/db-proxy"));
/**
 * Initializes TypeScript components and performs validation
 * @returns Promise that resolves when initialization is complete
 */
async function TS_handler() {
    try {
        // Ensure directories exist
        const directories = [
            path_1.default.join(__dirname, '..', 'logs'),
            path_1.default.join(__dirname, '..', 'data', 'levels'),
            path_1.default.join(__dirname, '..', 'data', 'accounts'),
            path_1.default.join(__dirname, '..', 'data', 'accounts', 'keys'),
            path_1.default.join(__dirname, '..', 'data', 'levels', 'deleted')
        ];
        for (const dir of directories) {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
                console_api_1.default.Log('TS_handler', `Created directory: ${dir}`);
            }
        }
        // Validate database connection
        await validateDatabaseConnection();
        // Check that routes are properly set up
        validateRoutes();
        console_api_1.default.Log('TS_handler', 'TypeScript initialization complete');
    }
    catch (error) {
        console_api_1.default.Error('TS_handler', `Error during initialization: ${error}`);
    }
    return;
}
/**
 * Validates database connection and required tables
 */
async function validateDatabaseConnection() {
    try {
        // Check connection
        await db_proxy_1.default.execute('SELECT 1');
        console_api_1.default.Log('TS_handler', 'Database connection successful');
        // Check essential tables
        const requiredTables = [
            'accounts', 'users', 'levels', 'comments',
            'friendships', 'blocks', 'modactions', 'roles',
            'dailyfeatures', 'songs'
        ];
        const [rows] = await db_proxy_1.default.execute('SHOW TABLES');
        const existingTables = rows.map((row) => Object.values(row)[0].toString().toLowerCase());
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        if (missingTables.length > 0) {
            console_api_1.default.Warn('TS_handler', `Missing required tables: ${missingTables.join(', ')}`);
        }
        else {
            console_api_1.default.Log('TS_handler', 'All required database tables exist');
        }
    }
    catch (error) {
        console_api_1.default.Error('TS_handler', `Database validation failed: ${error}`);
        throw error;
    }
}
/**
 * Validates routes and API endpoints
 */
function validateRoutes() {
    const apiDirectory = path_1.default.join(__dirname, '..', 'api');
    const routesDirectory = path_1.default.join(__dirname, '..', 'routes');
    // Check if essential API directories exist
    const requiredApiDirs = [
        'accounts', 'comments', 'friendships', 'levels',
        'lib', 'packs', 'communication', 'mods', 'other',
        'rewards', 'scores', 'system'
    ];
    const missingApiDirs = requiredApiDirs.filter(dir => !fs_1.default.existsSync(path_1.default.join(apiDirectory, dir)));
    if (missingApiDirs.length > 0) {
        console_api_1.default.Warn('TS_handler', `Missing API directories: ${missingApiDirs.join(', ')}`);
    }
    // Check if essential route directories exist
    const requiredRouteDirs = [
        'panel', 'cmd'
    ];
    const missingRouteDirs = requiredRouteDirs.filter(dir => !fs_1.default.existsSync(path_1.default.join(routesDirectory, dir)));
    if (missingRouteDirs.length > 0) {
        console_api_1.default.Warn('TS_handler', `Missing route directories: ${missingRouteDirs.join(', ')}`);
    }
    console_api_1.default.Log('TS_handler', 'Routes validation complete');
}
exports.default = TS_handler;
