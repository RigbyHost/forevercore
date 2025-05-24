import mysql, { Pool } from 'mysql2/promise';

const dbPools: { [key: string]: Pool } = {};

const manDB = {
	createConnection: async (id: string): Promise<Pool> => {
		/*if (id !== "MANDB_PROCESS") {
			return false;
		}*/
		if (!dbPools[id]) {
			const config = {
				host: "95.174.92.175", // or else
				user: "forever-db", 
				password: "1NFDurF137", 
				database: "forever-db", 
				port: 3306
			}
			dbPools[id] = mysql.createPool({
				...config,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0
			});
		}
		
		return dbPools[id];
	}
};

export default manDB;