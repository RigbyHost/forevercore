'package net.fimastgd.forevercore.api.friendships.deleteFriendRequests';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const deleteFriendRequests = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "Friend request not deleted: req.body.targetAccountID not found");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);
		let query;
		if (req.body.isSender && req.body.isSender == 1) {
			query = "DELETE from friendreqs WHERE accountID = ? AND toAccountID = ? LIMIT 1";
		} else {
			query = "DELETE from friendreqs WHERE toAccountID = ? AND accountID = ? LIMIT 1";
		}
		await db.execute(query, [accountID, targetAccountID]);
		ConsoleApi.Log("main", `Friend request from accountID ${targetAccountID} deleted by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.deleteFriendRequests`);
		return "-1";
	}
};

module.exports = deleteFriendRequests;
