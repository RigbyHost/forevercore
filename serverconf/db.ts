import mysql, { Pool } from "mysql2/promise";
import createDBThread from "./dbThread";
import envConfig from "./env-config";

const dbPools: { [key: string]: Pool } = {};

async function threadConnection(id: string): Promise<Pool> {
	if (!dbPools[id]) {
		const config = createDBThread(id);
		dbPools[id] = mysql.createPool({
			...config,
			waitForConnections: true,
			connectionLimit: envConfig.get("DB_CONNECTION_LIMIT"),
			queueLimit: 0
		});
	}

	return dbPools[id];
}

export default threadConnection;
