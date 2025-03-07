'package net.fimastgd.forevercore.api.levels.rateDemon';

const db = require("../../serverconf/db");
const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const rateDemon = async (accountIDStr, gjp2Str, gjpStr, ratingStr, levelIDStr, req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	const gjp2check = gjp2Str || gjpStr;
	if (!gjp2check || !ratingStr || !levelIDStr || !accountIDStr) {
		return "-1";
	}

	const gjp = await ExploitPatch.remove(gjp2check);
	const rating = await ExploitPatch.remove(ratingStr);
	const levelID = await ExploitPatch.remove(levelIDStr);

	try {
		const id = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
		if (!(await ApiLib.checkPermission(id, "actionRateDemon"))) {
			return "-1";
		}
		let dmn, dmnname;
		switch (parseInt(rating)) {
			case 1:
				dmn = 3;
				dmnname = "Easy";
				break;
			case 2:
				dmn = 4;
				dmnname = "Medium";
				break;
			case 3:
				dmn = 0;
				dmnname = "Hard";
				break;
			case 4:
				dmn = 5;
				dmnname = "Insane";
				break;
			case 5:
				dmn = 6;
				dmnname = "Extreme";
				break;
		}

		const timestamp = Math.floor(Date.now() / 1000);
		await db.execute("UPDATE levels SET starDemonDiff = ? WHERE levelID = ?", [dmn, levelID]);
		await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [10, dmnname, levelID, timestamp, id]);
		ConsoleApi.Log("main", `Rated level ${levelID} to demon: ${dmnname}`);
		return levelID.toString();
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateDemon`);
		return "-1";
	}
};

module.exports = rateDemon;
