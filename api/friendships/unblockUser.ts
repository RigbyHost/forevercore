`package net.fimastgd.forevercore.api.friendships.unblockUser`;

import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import GJPCheck from "../lib/GJPCheck";
import ExploitPatch from "../lib/exploitPatch";
import ConsoleApi from "../../modules/console-api";

/**
 * Unblocks a user in Geometry Dash
 * @param gdpsid - GDPS ID
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const unblockUser = async (gdpsid: string, req: Request): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Check if target account ID is provided
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "Failed to unblock user: targetAccountID not found");
			return "-1";
		}

		// Authenticate user
		const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);

		// Delete block record
		const query = "DELETE FROM blocks WHERE person1 = ? AND person2 = ?";
		await db.execute<ResultSetHeader>(query, [accountID, targetAccountID]);

		ConsoleApi.Log("main", `User ${targetAccountID} unblocked by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.unblockUser`);
		return "-1";
	}
};

export default unblockUser;
