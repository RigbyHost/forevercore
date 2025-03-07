import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import ConsoleApi from '../modules/console-api';

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
    waitForConnections?: boolean;
    connectionLimit?: number;
    queueLimit?: number;
    timezone?: string;
    charset?: string;
}

/**
 * Load database configuration
 * @returns Database configuration object
 */
function loadDatabaseConfig(): DatabaseConfig {
    try {
        // Try to load configuration from YAML file
        const configPath = path.join(__dirname, '../config/db.yml');
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents) as DatabaseConfig;

        // Validate required fields
        if (!config.host || !config.user || !config.database) {
            throw new Error('Missing required database configuration fields');
        }

        // Merge with default configuration
        return {
            ...config,
            port: config.port || 3306,
            waitForConnections: config.waitForConnections ?? true,
            connectionLimit: config.connectionLimit ?? 10,
            queueLimit: config.queueLimit ?? 0,
            timezone: config.timezone || '+00:00',
            charset: config.charset || 'utf8mb4'
        };
    } catch (error) {
        // Fallback to environment variables or default values
        ConsoleApi.Error('Database', `Error loading database configuration: ${error}`);
        return {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gdps',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            timezone: '+00:00',
            charset: 'utf8mb4'
        };
    }
}

// Create database connection pool
const config = loadDatabaseConfig();

ConsoleApi.Log('Database', `Connecting to database ${config.database} on ${config.host}`);

const pool = mysql.createPool({
    ...config,
    decimalNumbers: true // Handle DECIMAL and NUMERIC types as JS numbers
});

// Test connection
pool.execute('SELECT 1')
    .then(() => {
        ConsoleApi.Log('Database', 'Database connection successful');
    })
    .catch(error => {
        ConsoleApi.FatalError('Database', `Failed to connect to database: ${error}`);
        process.exit(1);
    });

export default pool;