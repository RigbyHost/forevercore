'package net.fimastgd.forevercore.api.scores.getCreators';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const getCreators = async (accountIDStr, typeStr) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		const accountID = await ExploitPatch.remove(accountIDStr);
		const type = await ExploitPatch.remove(typeStr);
		const query = "SELECT * FROM users WHERE isCreatorBanned = '0' ORDER BY creatorPoints DESC LIMIT 100";
		const [result] = await db.query(query);
		let pplstring = "";
		let xi = 0;
		for (const user of result) {
			xi++;
			const extid = isNaN(user.extID) ? 0 : user.extID;
			pplstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}|`;
		}
		pplstring = pplstring.slice(0, -1);
		ConsoleApi.Log("main", "Received creators by accountID: " + accountID);
		return pplstring;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getCreators`);
		return "-1";
	}
};

module.exports = getCreators;
