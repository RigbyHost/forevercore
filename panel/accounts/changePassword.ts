import * as bcrypt from "bcrypt";
import { KeyProtectedByPassword, Crypto } from "defuse";
import * as fs from "fs/promises";
import * as path from "path";
import * as c from "ansi-colors";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../../api/lib/exploitPatch";
import GeneratePass from "../../api/lib/generatePass";
import ConsoleApi from "../../modules/console-api";

interface RequestBody {
	userName: string;
	oldpassword: string;
	newpassword: string;
	accid: string;
}

interface Request {
	body: RequestBody;
}

interface AccountRow {
	accountID: number;
}

const changePassword = async (gdpsid: string, req: Request): Promise<string> => {
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

	const db = await threadConnection(gdpsid);
	const { userName, oldpassword, newpassword, accid } = req.body;
	const salt: string = "";

	try {
		const pass = await GeneratePass.isValidUsrname(gdpsid, userName, oldpassword, req);
		if (pass === 1) {
			const passhash = await bcrypt.hash(newpassword, 10);

			try {
				await db.query("UPDATE accounts SET password=?, salt=? WHERE userName=?", [passhash, salt, userName]);
				await GeneratePass.assignGJP2(gdpsid, accid, newpassword, req);

				const [rows] = (await db.query("SELECT accountID FROM accounts WHERE userName=?", [userName])) as [AccountRow[], any];
				const accountID = rows[0].accountID;
				const accountIDPS = accountID.toString();
				const saveDataPath = path.join(__dirname, "../../data/accounts", `${accountIDPS}.dat`);
				const saveData = await fs.readFile(saveDataPath, "utf8");

				const keyPath = path.join(__dirname, "../../data/accounts/keys", accountIDPS);
				const keyExists = await fs
					.access(keyPath)
					.then(() => true)
					.catch(() => false);

				if (keyExists) {
					const protected_key_encoded = await fs.readFile(keyPath, "utf8");
					if (protected_key_encoded) {
						const protected_key = KeyProtectedByPassword.loadFromAsciiSafeString(protected_key_encoded);
						const user_key = await protected_key.unlockKey(oldpassword);
						const decryptedSaveData = await Crypto.decrypt(saveData, user_key);
						await fs.writeFile(saveDataPath, decryptedSaveData, "utf8");
						await fs.writeFile(keyPath, "", "utf8");
					}
				}

				ConsoleApi.Log("main", `Panel action: changed password in account ${userName}`);
				return "1";
			} catch (error) {
				ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.main`);
				return "1";
			}
		} else {
			return "-1";
		}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changePassword`);
		return "-1";
	}
}

export default changePassword;