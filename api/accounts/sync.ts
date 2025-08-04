`package net.fimastgd.forevercore.api.accounts`;

import * as crypto from "crypto";
import * as fs from "fs/promises";
import threadConnection from "@/serverconf/db";
import * as path from "path";
import GeneratePass from "@api/lib/generatePass";
import ExploitPatch from "@api/lib/exploitPatch";
import * as c from "ansi-colors";
import ConsoleApi from "@console-api";
import __root from "@/__root";
import { KeyProtectedByPassword } from "defuse";

interface DatabaseRow {
	accountID: number;
}

const syncAccount = async (
	gdpsid: string,
	userNameStr: string,
	accountIDStr: string,
	passwordStr: string,
	gjp2Str: string,
	req: any
): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		
		function dateNow(): string {
			const currentDate = new Date();
			const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1)
				.toString()
				.padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate
				.getMinutes()
				.toString()
				.padStart(2, "0")}`;
			return fDate;
		}
		
		const password: string = passwordStr || "";
		let accountID: string = accountIDStr || "";
		const accountsPath: string = await path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts`, `backup_${accountIDStr}.dat`);
		const accountsKeyPath: string = await path.join(__root, `/GDPS_DATA/${gdpsid}/data/accounts/keys`, `${accountIDStr}`);
		
		async function getAccountID(userName: string): Promise<number | null> {
			const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]) as [DatabaseRow[], any];
			return rows.length ? rows[0].accountID : null;
		}
		
		function isNumeric(value: string): boolean {
			return /^\d+$/.test(value);
		}
		
		async function fileExists(Path: string): Promise<boolean> {
			try {
				await fs.access(Path);
				return true;
			} catch {
				return false;
			}
		}
		
		function decrypt(data: string, key: Buffer): string {
			const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
			let decrypted = decipher.update(data, "base64", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		}
		
		if (!accountID) {
			const userName: string = await ExploitPatch.remove(userNameStr);
			const fetchedAccountID = await getAccountID(userName);
			accountID = fetchedAccountID ? fetchedAccountID.toString() : "";
		} else {
			accountID = await ExploitPatch.remove(accountIDStr);
		}
		
		let pass: number = 0;
		if (passwordStr) {
			pass = await GeneratePass.isValid(gdpsid, accountID, passwordStr, req);
		} else if (gjp2Str) {
			pass = await GeneratePass.isGJP2Valid(gdpsid, accountID, gjp2Str, req);
		}
		
		if (pass == 1) {
			if (!(await fileExists(accountsPath))) {
				// console.log("-1");
				// console.log(c.red(`[${dateNow()}] [main/ERROR]: Failed to sync account: ${accountIDStr}`));
				ConsoleApi.Log("main", `Failed to sync account ${accountIDStr}: save data not found`);
				return "-1";
			}
			
			let saveData: string = await fs.readFile(accountsPath, "utf8");
			
			if ((await fileExists(accountsKeyPath)) && !saveData.startsWith("H4s")) {
				const protectedKeyEncoded: string = await fs.readFile(accountsKeyPath, "utf8");
				const protectedKey = KeyProtectedByPassword.loadFromAsciiSafeString(protectedKeyEncoded);
				const userKey: Buffer = protectedKey.unlockKey(password);
				
				try {
					saveData = decrypt(saveData, userKey);
					await fs.writeFile(accountsPath, saveData);
					await fs.writeFile(accountsKeyPath, "");
				} catch (err) {
					ConsoleApi.Error("main", 'Server returned "-3" - file system exception at net.fimastgd.forevercore.api.accounts.sync');
					return "-3";
				}
			}
			
			// console.log(`${saveData};21;30;a;a`);
			ConsoleApi.Log("main", `Synced account: ${accountIDStr}`);
			return `${saveData};21;30;a;a`;
		} else {
			ConsoleApi.Log("main", `Failed to sync account: ${accountIDStr} - invalid pass`);
			return "-2";
		}
	} catch (error) {
		ConsoleApi.Warn("main", `Check the data for damage at net.fimastgd.forevercore.api.accounts.sync`);
		ConsoleApi.Error(
			"main",
			`Unhandled server exception with user sync account, automatic protection trying to not calling at net.fimastgd.forevercore.api.accounts.sync\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.sync`
		);
		return "-1";
	}
};

export default syncAccount;