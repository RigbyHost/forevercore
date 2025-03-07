'package net.fimastgd.forevercore.api.friendships.uploadFriendRequest';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");

const ConsoleApi = require("../../modules/console-api");

const uploadFriendRequest = async (accountIDStr, gjp2Str, gjpStr, toAccountIDStr, commentStr, req) => {
	try {
	if (!toAccountIDStr) {
		ConsoleApi.Log("main", `Failed to upload friend request: toAccountIDStr not found`);
		return "-1";
	}
	const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
	const toAccountID = await ExploitPatch.number(toAccountIDStr);

	if (toAccountID == accountID) {
		ConsoleApi.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: toAccountID equal accountID`);
		return "-1";
	}
	const comment = await ExploitPatch.remove(commentStr);
	const uploadDate = Math.floor(Date.now() / 1000);

	const [blocked] = await db.query("SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?", [toAccountID, accountID]);
	const [frSOnly] = await db.query("SELECT frS FROM `accounts` WHERE accountID = ? AND frS = 1", [toAccountID]);
	const [existingRequests] = await db.query("SELECT count(*) as count FROM friendreqs WHERE (accountID = ? AND toAccountID = ?) OR (toAccountID = ? AND accountID = ?)", [accountID, toAccountID, accountID, toAccountID]);
	if (existingRequests[0].count == 0 && !blocked.length && !frSOnly.length) {
		await db.query("INSERT INTO friendreqs (accountID, toAccountID, comment, uploadDate) VALUES (?, ?, ?, ?)", [accountID, toAccountID, comment, uploadDate]);
		ConsoleApi.Log("main", `Uploaded friend request to ${targetAccountID} from ${accountID}`);
		return "1";
	} else {
		ConsoleApi.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: existingRequests[0].count equal '0' and blocked.length not found and frSOnly.length not found`);
		return "-1";
	}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.uploadFriendRequest`);
	}
};
 
module.exports = uploadFriendRequest;
