import mysql, { Pool } from 'mysql2/promise';
import createDBThread from './dbThread';

const dbPools: { [key: string]: Pool } = {};

async function threadConnection(id: string): Promise<Pool> {
    if (!dbPools[id]) {
        const config = createDBThread(id);
        dbPools[id] = mysql.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    return dbPools[id];
}

export default threadConnection;