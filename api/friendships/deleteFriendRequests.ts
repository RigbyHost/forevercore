"package net.fimastgd.forevercore.api.friendships.deleteFriendRequests";

import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import ConsoleApi from "../../modules/console-api";

/**
 * Deletes a friend request in Geometry Dash
 * @param gdpsid - GDPS ID
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const deleteFriendRequests = async (gdpsid: string, req: Request): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "Friend request not deleted: req.body.targetAccountID not found");
			return "-1";
		}

		const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);

		let query: string;
		if (req.body.isSender && req.body.isSender == 1) {
			query = "DELETE from friendreqs WHERE accountID = ? AND toAccountID = ? LIMIT 1";
		} else {
			query = "DELETE from friendreqs WHERE toAccountID = ? AND accountID = ? LIMIT 1";
		}

		await db.execute<ResultSetHeader>(query, [accountID, targetAccountID]);

		ConsoleApi.Log("main", `Friend request from accountID ${targetAccountID} deleted by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.deleteFriendRequests`);
		return "-1";
	}
};

export default deleteFriendRequests;
