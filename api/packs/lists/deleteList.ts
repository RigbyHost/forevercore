import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../../serverconf/db";
import ExploitPatch from "../../lib/exploitPatch";
import ApiLib from "../../lib/apiLib";
import GJPCheck from "../../lib/GJPCheck";
import ConsoleApi from "../../../modules/console-api";

/**
 * Deletes a list in Geometry Dash
 * @param gdpsid - GDPS ID
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const deleteList = async (gdpsid: string, req: Request): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Authenticate user
		const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const listID = await ExploitPatch.number(req.body.listID);

		// Check if user owns the list
		if (isNaN(Number(listID)) || String(accountID) !== String(await ApiLib.getListOwner(gdpsid, listID))) {
			return "-1";
		}

		// Delete the list
		const [result] = await db.execute<ResultSetHeader>("DELETE FROM lists WHERE listID = ?", [listID]);

		ConsoleApi.Log("main", `List ${listID} deleted by accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.deleteList`);
		return "-1";
	}
};

export default deleteList;
