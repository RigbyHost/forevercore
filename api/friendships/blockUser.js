'package net.fimastgd.forevercore.api.friendships.blockUser';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const blockUser = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.targetAccountID) {
			ConsoleApi.Log("main", "User not blocked: req.body.targetAccountID not found");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);
		if (accountID == targetAccountID) {
			ConsoleApi.Log("main", `User ${targetAccountID} not blocked by ${accountID}: accountID equal targetAccountID`);
			return "-1";
		}
		const [result] = await db.execute("INSERT INTO blocks (person1, person2) VALUES (?, ?)", [accountID, targetAccountID]);
		ConsoleApi.Log("main", `User ${targetAccountID} blocked by ${accountID}`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.blockUser`);
		return "-1";
	}
};

module.exports = blockUser;
