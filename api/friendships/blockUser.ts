import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import ConsoleApi from "../../modules/console-api";

/**
 * Blocks a user in Geometry Dash
 * @param gdpsid - GDPS ID
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const blockUser = async (gdpsid: string, req: Request): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Check if target account ID is provided
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "User not blocked: req.body.targetAccountID not found");
			return "-1";
		}

		// Authenticate user
		const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);

		// Prevent self-blocking
		if (accountID == targetAccountID) {
			ConsoleApi.Log("main", `User ${targetAccountID} not blocked by ${accountID}: accountID equal targetAccountID`);
			return "-1";
		}

		// Create block record
		const [result] = await db.execute<ResultSetHeader>("INSERT INTO blocks (person1, person2) VALUES (?, ?)", [accountID, targetAccountID]);

		ConsoleApi.Log("main", `User ${targetAccountID} blocked by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.blockUser`);
		return "-1";
	}
};

export default blockUser;
