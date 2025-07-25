"package net.fimastgd.forevercore.panel.leaderboard.unban";

import { RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "net.fimastgd.forevercore.modules.console-api";
import * as c from "ansi-colors";

type int = number;

// 1 = unbanned (success)
// -1 = account not found
// -2 = unknown error

async function unbanUser(gdpsid: string, userName: string): Promise<int> {
	const db = await threadConnection(gdpsid);
	async function getAccountID(userName: string): Promise<int | null> {
		try {
			const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
			if (rows.length > 0) {
				return rows[0].accountID;
			} else {
				return null;
			}
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.leaderboard.unban`);
			return null;
		}
	}

	try {
		const accountID = await getAccountID(userName);
		if (accountID === null) {
			return -1;
		}
		const [updateResult]: [ResultSetHeader, FieldPacket[]] = await db.execute("UPDATE users SET isBanned = 0 WHERE LOWER(userName) = LOWER(?)", [
			userName
		]);
		const timestamp = Math.floor(Date.now() / 1000);
		await db.execute("INSERT INTO modactions (type, value, value2, timestamp, account) VALUES ('15', ?, '0', ?, ?)", [
			accountID,
			timestamp,
			accountID
		]);
		ConsoleApi.Log("main", `Panel action: unbanned user: ${userName}`);
		return 1;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.leaderboard.unban`);
		return -2;
	}
}

export default unbanUser;
