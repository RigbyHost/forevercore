'package net.fimastgd.forevercore.api.friendships.removeFriend';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const removeFriend = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "Failed to remove friend: req.body.targetAccountID not found");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);
		const query1 = "DELETE FROM friendships WHERE person1 = ? AND person2 = ?";
		const query2 = "DELETE FROM friendships WHERE person2 = ? AND person1 = ?";
		await db.execute(query1, [accountID, targetAccountID]);
		await db.execute(query2, [accountID, targetAccountID]);
		ConsoleApi.Log("main", `Friend ${targetAccountID} removed by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.removeFriend`);
		return "-1";
	}
};

module.exports = removeFriend;
