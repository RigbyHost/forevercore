'package net.fimastgd.forevercore.serverconf.db';

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
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
        // Try to load configuration from file
        const configPath = path.join(__dirname, 'database.json');
        if (fs.existsSync(configPath)) {
            const configText = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configText);

            // Validate required fields
            if (!config.host || !config.user || !config.database) {
                throw new Error('Missing required database configuration fields');
            }

            return config;
        }

        // Default configuration if no file found
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
    } catch (error) {
        ConsoleApi.Error('Database', `Error loading database configuration: ${error}`);
        process.exit(1);
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