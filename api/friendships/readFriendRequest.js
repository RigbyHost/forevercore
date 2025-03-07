'package net.fimastgd.forevercore.api.friendships.readFriendRequest';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const readFriendRequest = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.requestID) {
			ConsoleApi.Log("main", "Failed to read friend request: req.body.requestID not found");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const requestID = await ExploitPatch.remove(req.body.requestID);
		const [result] = await db.execute("UPDATE friendreqs SET isNew='0' WHERE ID = ? AND toAccountID = ?", [requestID, accountID]);
		ConsoleApi.Log("main", `Read friend request ${requestID}. accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.readFriendRequest`);
		return "-1";
	}
};

module.exports = readFriendRequest;
