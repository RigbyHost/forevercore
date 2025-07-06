"package net.fimastgd.forevercore.api.accounts.updateSettings";

import { Request } from "express";
import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import ConsoleApi from "../../modules/console-api";

/**
 * Updates account settings for a GD account
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2
 * @param gjpStr - GJP
 * @param mSStr - Message privacy
 * @param frSStr - Friend request privacy
 * @param cSStr - Comment privacy
 * @param ytStr - YouTube URL
 * @param xStr - Twitter/X handle
 * @param twitchStr - Twitch URL
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const updateSettings = async (
	gdpsid: string,
	accountIDStr?: string,
	gjp2Str?: string,
	gjpStr?: string,
	mSStr?: string,
	frSStr?: string,
	cSStr?: string,
	ytStr?: string,
	xStr?: string,
	twitchStr?: string,
	req?: Request
): Promise<string> => {
	const db = await threadConnection(gdpsid as string);
	try {
		if (!accountIDStr) throw new Error("accountID is not defined");

		// Authenticate user
		const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);

		// Process parameters
		const mS = mSStr ? await ExploitPatch.remove(mSStr) : 0;
		const frS = frSStr ? await ExploitPatch.remove(frSStr) : 0;
		const cS = cSStr ? await ExploitPatch.remove(cSStr) : 0;
		const youtubeurl = ytStr ? await ExploitPatch.remove(ytStr) : "";
		const x = xStr ? await ExploitPatch.remove(xStr) : ""; // Twitter/X handle
		const twitch = twitchStr ? await ExploitPatch.remove(twitchStr) : "";

		// Update account settings
		const query = "UPDATE accounts SET mS = ?, frS = ?, cS = ?, youtubeurl = ?, twitter = ?, twitch = ? WHERE accountID = ?";
		await db.execute<ResultSetHeader>(query, [mS, frS, cS, youtubeurl, x, twitch, accountID]);

		ConsoleApi.Log("main", `User profile settings updated in accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.accounts.updateSettings`);
		return "-1";
	}
};

export default updateSettings;
