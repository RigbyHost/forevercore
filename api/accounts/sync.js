"package net.fimastgd.forevercore.api.accounts.sync";

const crypto = require("crypto");
const fs = require("fs").promises;
const threadConnection = require("../../serverconf/db").default;
const path = require("path");
const GeneratePass = require("../lib/generatePass").default;
const ExploitPatch = require("../lib/exploitPatch").default;
const c = require("ansi-colors");
const ConsoleApi = require("../../modules/console-api").default;
const __root = require("../../__root").default;

const syncAccount = async (gdpsid, userNameStr, accountIDStr, passwordStr, gjp2Str, req) => {
	try {
		const db = await threadConnection(gdpsid);
		function dateNow() {
			const currentDate = new Date();
			const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1)
				.toString()
				.padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate
				.getMinutes()
				.toString()
				.padStart(2, "0")}`;
			return fDate;
		}
		const password = passwordStr || "";
		let accountID = accountIDStr || "";

		const accountsPath = await path.join(__root, "/data/accounts", `backup_${accountIDStr}.dat`);
		const accountsKeyPath = await path.join(__root, "/data/accounts/keys", `${accountIDStr}`);

		async function getAccountID(userName) {
			const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
			return rows.length ? rows[0].accountID : null;
		}

		function isNumeric(value) {
			return /^\d+$/.test(value);
		}

		async function fileExists(path) {
			try {
				await fs.access(path);
				return true;
			} catch {
				return false;
			}
		}

		function decrypt(data, key) {
			const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
			let decrypted = decipher.update(data, "base64", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		}

		if (!accountID) {
			const userName = await ExploitPatch.remove(userNameStr);
			accountID = await getAccountID(userName);
		} else {
			accountID = await ExploitPatch.remove(accountIDStr);
		}

		let pass = 0;
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

			let saveData = await fs.readFile(accountsPath, "utf8");
			if ((await fileExists(accountsKeyPath)) && !saveData.startsWith("H4s")) {
				const protectedKeyEncoded = await fs.readFile(accountsKeyPath, "utf8");
				const protectedKey = KeyProtectedByPassword.loadFromAsciiSafeString(protectedKeyEncoded);
				const userKey = protectedKey.unlockKey(password);

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

module.exports = syncAccount;
