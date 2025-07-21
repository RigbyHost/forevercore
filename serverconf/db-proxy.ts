import threadConnection from './db';
import { Pool, QueryResult, FieldPacket } from 'mysql2/promise';

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
    async execute<T extends QueryResult>(sql: string, values?: any): Promise<[T, FieldPacket[]]> {
        const conn = await getConnection();
        return conn.execute<T>(sql, values);
    },
    
    async query<T extends QueryResult>(sql: string, values?: any): Promise<[T, FieldPacket[]]> {
        const conn = await getConnection();
        return conn.query<T>(sql, values);
    }
};

export default dbProxy;