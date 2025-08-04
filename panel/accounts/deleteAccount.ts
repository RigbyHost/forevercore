"package net.fimastgd.forevercore.panel.accounts.deleteAccount";

import { ResultSetHeader } from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";
import __root from "@/__root";

/**
 * Deletes a user account
 * @param gdpsid - GDPS ID
 * @param accountID - Account ID to delete
 * @returns "1" if successful, "-1" if failed
 */
const deleteAccount = async (gdpsid: string, accountID: string | number): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Delete account data from database
		const [accountResult] = await db.query<ResultSetHeader>("DELETE FROM accounts WHERE accountID = ?", [accountID]);

		// Delete user data if it exists
		const [rows] = await db.query<ResultSetHeader[]>("SELECT * FROM users WHERE extID = ?", [accountID]);

		if (rows && rows.length > 0) {
			await db.query<ResultSetHeader>("DELETE FROM users WHERE extID = ?", [accountID]);
		}

		// Delete account save data files
		const accountPath = path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts`, `backup_${accountID}.dat`);
		const keysPath = path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts/keys`, `${accountID.toString()}`);

		// Delete files (ignoring if they don't exist)
		await fs.unlink(accountPath).catch(err => {
			if (err.code !== "ENOENT") throw err;
		});

		await fs.unlink(keysPath).catch(err => {
			if (err.code !== "ENOENT") throw err;
		});

		ConsoleApi.Log("main", `Panel action: deleted account. accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} net.fimastgd.forevercore.panel.accounts.deleteAccount`);
		return "-1";
	}
};

export default deleteAccount;
