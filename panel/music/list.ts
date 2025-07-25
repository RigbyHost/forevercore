"package net.fimastgd.forevercore.panel.music.list";

import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import ConsoleApi from "net.fimastgd.forevercore.modules.console-api";
import threadConnection from "../../serverconf/db";

async function getSongList(gdpsid: string, OFFSET): Promise<RowDataPacket[]> {
	try {
		const db = await threadConnection(gdpsid);
		if (parseInt(OFFSET) > 250) {
			return [];
		}
		if (parseInt(OFFSET) > 0) {
			OFFSET = `${OFFSET}0`;
			OFFSET = parseInt(OFFSET);
		} else if (OFFSET < 0) {
			OFFSET = "0";
		} else {
			OFFSET = "0";
		}
		const [rows] = await db.query<RowDataPacket[]>(
			`SELECT * FROM (SELECT * FROM songs LIMIT 20 OFFSET ${OFFSET * 2}) AS subquery ORDER BY id ASC`
		);
		ConsoleApi.Log("main", `Panel action: received song list. offset: ${OFFSET}`);
		return rows;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.list`);
		return [];
	}
}

export default getSongList;
