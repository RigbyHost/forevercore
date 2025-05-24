import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
}

function createDBThread(id: string): DatabaseConfig {
    const configPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/db.yml`);
    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file for ID ${id} not found`);
    }

    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as DatabaseConfig;

    if (!config.host || !config.user || !config.database) {
        throw new Error(`Invalid config for ID ${id}`);
    }

    return config;
}

export default createDBThread;