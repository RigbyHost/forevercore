"package net.fimastgd.forevercore.api.levels.updateDesc";

import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import ConsoleApi from "../../modules/console-api";

/**
 * Updates a level description in Geometry Dash
 * @param gdpsid - GDPS ID
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param levelIDStr - Level ID to update
 * @param levelDescStr - New level description
 * @param udidStr - Device ID
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const updateDesc = async (
	gdpsid: string,
	accountIDStr?: string,
	gjp2Str?: string,
	gjpStr?: string,
	levelIDStr?: string,
	levelDescStr?: string,
	udidStr?: string,
	req?: Request
): Promise<string> => {
	try {
		// Connection to db
		const db = await threadConnection(gdpsid);
		// Process parameters
		let levelDesc = await ExploitPatch.remove(levelDescStr);
		const levelID = await ExploitPatch.remove(levelIDStr);

		// Get account ID
		let id: string;

		if (udidStr) {
			id = await ExploitPatch.remove(udidStr);
			if (!isNaN(Number(id))) {
				return "-1";
			}
		} else {
			id = await GJPCheck.getAccountIDOrDie(gdpsid, accountIDStr, gjp2Str, gjpStr, req);
		}

		// Decode and fix description
		let rawDesc = Buffer.from(levelDesc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");

		// Fix unclosed color tags
		if (rawDesc.includes("<c")) {
			const openTags = (rawDesc.match(/<c/g) || []).length;
			const closeTags = (rawDesc.match(/<\/c>/g) || []).length;

			if (openTags > closeTags) {
				rawDesc += "</c>".repeat(openTags - closeTags);
				levelDesc = Buffer.from(rawDesc).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
			}
		}

		// Update level description
		await db.execute<ResultSetHeader>("UPDATE levels SET levelDesc = ? WHERE levelID = ? AND extID = ?", [levelDesc, levelID, id]);

		ConsoleApi.Log("main", `Updated level desc: ${levelID}`);
		return "1";
	} catch (IOException) {
		ConsoleApi.Error("main", `${IOException} at net.fimastgd.forevercore.api.levels.updateDesc`);
		return "-1";
	}
};

export default updateDesc;
