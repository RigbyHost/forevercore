import threadConnection from './db';
import { Pool } from 'mysql2/promise';

// Temporary proxy for backward compatibility
// This creates a singleton connection for the default GDPS
// TODO: This should be refactored to properly handle multiple GDPS instances

let defaultConnection: Pool | null = null;

async function getConnection(): Promise<Pool> {
    if (!defaultConnection) {
        defaultConnection = await threadConnection('main');
    }
    return defaultConnection;
}

// Export a proxy object that mimics the old db interface
const dbProxy = {
    async execute(sql: string, values?: any) {
        const conn = await getConnection();
        return conn.execute(sql, values);
    },
    
    async query(sql: string, values?: any) {
        const conn = await getConnection();
        return conn.query(sql, values);
    }
};

export default dbProxy;