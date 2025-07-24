import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import ConsoleApi from "../../modules/console-api";

/**
 * Marks a friend request as read in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const readFriendRequest = async (gdpsid: string, req: Request): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Check if request ID is provided
		if (!req.body.requestID) {
			ConsoleApi.Log("main", "Failed to read friend request: req.body.requestID not found");
			return "-1";
		}

		// Authenticate user
		const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const requestID = await ExploitPatch.remove(req.body.requestID);

		// Mark request as read
		const [result] = await db.execute<ResultSetHeader>("UPDATE friendreqs SET isNew='0' WHERE ID = ? AND toAccountID = ?", [
			requestID,
			accountID
		]);

		ConsoleApi.Log("main", `Read friend request ${requestID}. accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.readFriendRequest`);
		return "-1";
	}
};

export default readFriendRequest;
