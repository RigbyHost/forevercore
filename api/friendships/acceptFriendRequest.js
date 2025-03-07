'package net.fimastgd.forevercore.api.friendships.acceptFriendRequest';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const acceptFriendRequest = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.requestID) {
			ConsoleApi.Log("main", "Friend request not accept: requestID not found");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const requestID = await ExploitPatch.remove(req.body.requestID);
		const [requests] = await db.query("SELECT accountID, toAccountID FROM friendreqs WHERE ID = ?", [requestID]);
		if (requests.length === 0) {
			ConsoleApi.Log("main", "Friend request not accept: requests.length equal '0");
			return "-1";
		}
		const request = requests[0];
		const reqAccountID = request.accountID;
		const toAccountID = request.toAccountID;
		if (toAccountID != accountID || reqAccountID == accountID) {
			ConsoleApi.Log("main", "Friend request not accept: toAccountID not equal accountID or reqAccountID equal accountID");
			return "-1";
		}
		await db.query("INSERT INTO friendships (person1, person2, isNew1, isNew2) VALUES (?, ?, 1, 1)", [reqAccountID, toAccountID]);
		await db.query("DELETE from friendreqs WHERE ID = ? LIMIT 1", [requestID]);
		ConsoleApi.Log("main", `Accept friend request ${requestID} to accountID: ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.acceptFriendRequest`);
		return "-1";
	}
};

module.exports = acceptFriendRequest;
