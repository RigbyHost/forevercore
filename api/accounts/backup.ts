`package net.fimastgd.forevercore.api.accounts.backup`;

import * as path from "path";
import * as fs from "fs/promises";
import * as zlib from "zlib";
import { promisify } from "util";
import threadConnection from "@/serverconf/db";
import ExploitPatch from "@api/lib/exploitPatch";
import GeneratePass from "@api/lib/generatePass";
import ConsoleApi from "@/console-api";
import __root from "@/root";

const gunzip = promisify(zlib.gunzip);
const gzip = promisify(zlib.gzip);

const backupAccount = async (
	gdpsid: string,
	userNameOr: string | undefined,
	passwordOr: string | undefined,
	saveDataOr: string,
	accountIDOr: string | undefined,
	gjp2Or: string | undefined,
	req: any
): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		let userName: string | null = null;
		let accountID: string | null = null;
		let extID: string | null = null;
		let userNameFin: string | null = null;

		// handle missing userNameOr
		if (!userNameOr && accountIDOr) {
			const [rows] = await db.execute("SELECT userName FROM accounts WHERE accountID = ?", [accountIDOr]);
			userNameOr = rows.length ? rows[0].userName : null;
		}

		// sanitize username
		if (userNameOr) {
			userName = await ExploitPatch.remove(userNameOr);
		}

		const password = passwordOr || "";
		const saveData = await ExploitPatch.remove(saveDataOr);

		// resolve account ID
		if (!accountIDOr && userName) {
			const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
			accountID = rows.length ? String(rows[0].accountID) : null;
		} else if (accountIDOr) {
			accountID = await ExploitPatch.remove(accountIDOr);
		}

		if (!accountID || !isFinite(Number(accountID))) {
			ConsoleApi.Log("main", `Failed to backup account: ${accountID}`);
			return "-1";
		}

		// validate credentials
		let pass = 0;
		if (passwordOr) {
			pass = await GeneratePass.isValid(gdpsid, accountID, passwordOr, req);
		} else if (gjp2Or) {
			pass = await GeneratePass.isGJP2Valid(gdpsid, accountID, gjp2Or, req);
		}

		if (pass !== 1) {
			ConsoleApi.Log("main", `Failed to backup account. ID: ${accountID}`);
			return "-1";
		}

		// process save data
		const saveDataArr = saveDataOr.split(";");
		let saveDataDecoded = saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/");
		saveDataDecoded = Buffer.from(saveDataDecoded, "base64");
		saveDataDecoded = (await gunzip(saveDataDecoded)).toString();

		const orbs = saveDataDecoded.split("</s><k>14</k><s>")[1].split("</s>")[0];
		const lvls = saveDataDecoded.split("<k>GS_value</k>")[1].split("</s><k>4</k><s>")[1].split("</s>")[0];

		// anonymize password in save data
		const anonymizedSaveData = saveDataDecoded.replace(`<k>GJA_002</k><s>${passwordOr}</s>`, "<k>GJA_002</k><s>password</s>");

		// compress and format save data
		const compressedData = await gzip(Buffer.from(anonymizedSaveData));
		const finalSaveData = compressedData.toString("base64").replace(/\+/g, "-").replace(/\//g, "_") + ";" + saveDataArr[1];

		// write account files
		const accountsPath = path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts`, `backup_${accountID}.dat`);
		const accountsKeyPath = path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts/keys`, `${accountID}`);
		await fs.writeFile(accountsPath, finalSaveData);
		await fs.writeFile(accountsKeyPath, "");

		// resolve user identifier for update
		if (userName) {
			const [rows] = await db.execute("SELECT extID FROM users WHERE userName = ? LIMIT 1", [userName]);
			extID = rows.length ? rows[0].extID : null;
		} else {
			const [rows] = await db.execute("SELECT userName FROM users WHERE extID = ? LIMIT 1", [accountID]);
			userNameFin = rows.length ? rows[0].userName : null;
		}

		// update user stats
		if (extID) {
			await db.execute("UPDATE users SET orbs = ?, completedLvls = ? WHERE extID = ?", [orbs, lvls, extID]);
		} else if (userNameFin) {
			await db.execute("UPDATE users SET orbs = ?, completedLvls = ? WHERE userName = ?", [orbs, lvls, userNameFin]);
		}

		ConsoleApi.Log("main", `Account backuped. ID: ${accountID}`);
		return "1";
	} catch (err) {
		ConsoleApi.Error("main", `${(err as Error).message} at net.fimastgd.forevercore.api.accounts.backup`);
		return "-1";
	}
};

export default backupAccount;
