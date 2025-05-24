'package net.fimastgd.forevercore.SystemControl.validation.checkGDPS';

import { RowDataPacket } from 'mysql2/promise';
import manDB from '../../serverconf/man-db';
import ConsoleApi from '../../modules/console-api';

export async function checkGDPS(id: string, node: string): Promise<boolean> {
	try {
		const mandb = await manDB.createConnection("MANDB_PROCESS");
		const [rows] = await mandb.execute<RowDataPacket[]>(
			`SELECT * FROM servers
				WHERE serverID = ? AND node = ?`, 
			[id, node]
		);
		return (rows.length > 0) ? true : false;
	} catch (e) {
		ConsoleApi.Error("SystemControl", `${e} at net.fimastgd.forevercore.SystemControl.SystemControl.validation.checkGDPS`);
		return false;
	}
}  