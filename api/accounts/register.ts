import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import ExploitPatch from "../lib/exploitPatch";
import GeneratePass from "../lib/generatePass";
import bcrypt from "bcryptjs";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";

/**
 * Register a new Geometry Dash account
 * @param userNameStr - Username
 * @param passwordStr - Password
 * @param emailStr - Email address
 * @returns "1" if successful, "-2" if username exists, "-4" if username too long, "-1" for other errors
 */
const registerAccount = async (gdpsid: string, userNameStr?: string, passwordStr?: string, emailStr?: string): Promise<string> => {
	const db = await threadConnection(gdpsid);
	try {
		if (!userNameStr || userNameStr === "") {
			return "-1";
		}

		const userName = await ExploitPatch.remove(userNameStr);
		const password = await ExploitPatch.remove(passwordStr);
		const email = await ExploitPatch.remove(emailStr);

		// Check username length
		if (userName.length > 20) {
			ConsoleApi.Log("main", `Failed to register a new account: ${userName} - username too long`);
			return "-4";
		}

		// Check if username exists
		const query2 = "SELECT count(*) FROM accounts WHERE userName LIKE ?";
		const [rows] = await db.execute<RowDataPacket[]>(query2, [userName]);
		const regusrs = rows[0]["count(*)"];

		if (regusrs > 0) {
			ConsoleApi.Log("main", `Failed to register a new account: ${userName} - account already exists`);
			return "-2";
		} else {
			// Hash password
			const hashpass = await bcrypt.hash(password, 10);
			const gjp2 = await GeneratePass.GJP2hash(password);
			const registerDate = Math.floor(Date.now() / 1000);

			// Create account
			const query = "INSERT INTO accounts (userName, password, email, registerDate, isActive, gjp2) VALUES (?, ?, ?, ?, ?, ?)";
			await db.execute<ResultSetHeader>(query, [userName, hashpass, email, registerDate, 0, gjp2]);

			ConsoleApi.Log("main", `New account registered: ${userName}`);
			return "1";
		}
	} catch (error) {
		ConsoleApi.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.register");
		ConsoleApi.FatalError(
			"main",
			`Unhandled server exception with user register a new account, automatic protection called at net.fimastgd.forevercore.api.accounts.register\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.register`
		);
		return "-1";
	}
};

export default registerAccount;
