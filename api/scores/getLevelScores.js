'package net.fimastgd.forevercore.api.scores.getLevelScores';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const XORCipher = require("../lib/XORCipher");
const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getLevelScores = async (accountIDStr, gjp2Str, gjpStr, levelIDStr, percentStr, s1Str, s2Str, s3Str, s6Str, s9Str, s10Str, typeStr, req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
		const levelID = await ExploitPatch.remove(levelIDStr);
		const percent = await ExploitPatch.remove(percentStr);
		const uploadDate = Math.floor(Date.now() / 1000);
		const attempts = s1Str != "" ? s1Str - 8354 : 0;
		const clicks = s2Str != "" ? s2Str - 3991 : 0;
		const time = s3Str != "" ? s3Str - 4085 : 0;
		const progresses = s6Str != "" ? await XORCipher.cipher(Buffer.from(s6Str.replace(/_/g, "/").replace(/-/g, "+"), "base64").toString(), 41274) : 0;
		const coins = s9Str != "" ? s9Str - 5819 : 0;
		const dailyID = s10Str != "" ? s10Str : 0;
		const userID = await ApiLib.getUserID(accountID);
		const condition = dailyID > 0 ? ">" : "=";
		const [oldPercentRows] = await db.query("SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ? AND dailyID " + condition + " 0", [accountID, levelID]);
		const oldPercent = oldPercentRows.length > 0 ? oldPercentRows[0].percent : null;
		if (oldPercentRows.length == 0) {
			await db.query("INSERT INTO levelscores (accountID, levelID, percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [accountID, levelID, percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID]);
		} else {
			if (oldPercent <= percent) {
				await db.query("UPDATE levelscores SET percent=?, uploadDate=?, coins=?, attempts=?, clicks=?, time=?, progresses=?, dailyID=? WHERE accountID=? AND levelID=? AND dailyID " + condition + " 0", [percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID, accountID, levelID]);
			} else {
				const [count] = await db.query("SELECT count(*) as count FROM levelscores WHERE percent=? AND uploadDate=? AND accountID=? AND levelID=? AND coins = ? AND attempts = ? AND clicks = ? AND time = ? AND progresses = ? AND dailyID = ?", [percent, uploadDate, accountID, levelID, coins, attempts, clicks, time, progresses, dailyID]);
				if (count[0].count == 0) {
					// Handle this case if needed
				}
			}
		}
		if (percent > 100) {
			await db.query("UPDATE users SET isBanned=1 WHERE extID = ?", [accountID]);
		}
		const type = typeStr ? parseInt(typeStr) : 1;
		let query, queryArgs;
		switch (type) {
			case 0:
				const friends = await ApiLib.getFriends(accountID);
				friends.push(accountID);
				const friendsString = friends.join(",");
				query = "SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID " + condition + " 0 AND levelID = ? AND accountID IN (" + friendsString + ") ORDER BY percent DESC";
				queryArgs = [levelID];
				break;
			case 1:
				query = "SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID " + condition + " 0 AND levelID = ? ORDER BY percent DESC";
				queryArgs = [levelID];
				break;
			case 2:
				query = "SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID " + condition + " 0 AND levelID = ? AND uploadDate > ? ORDER BY percent DESC";
				queryArgs = [levelID, Math.floor(Date.now() / 1000) - 604800];
				break;
			default:
				return "-1";
		}
		const [scores] = await db.query(query, queryArgs);
		let response = "";
		for (const score of scores) {
			const [userRows] = await db.query("SELECT userName, userID, icon, color1, color2, color3, iconType, special, extID, isBanned FROM users WHERE extID = ?", [score.accountID]);
			const user = userRows[0];
			const time = new Date(score.uploadDate * 1000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "").replace(/:/, ".");
			if (user.isBanned == 0) {
				let place;
				if (score.percent == 100) {
					place = 1;
				} else if (score.percent > 75) {
					place = 2;
				} else {
					place = 3;
				}
				response += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${user.extID}:3:${score.percent}:6:${place}:13:${score.coins}:42:${time}|`;
			}
		}
		ConsoleApi.Log("main", "Received level scores by accountID: " + accountID);
		return response;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getLevelScores`);	
		return "-1";
	}
};

module.exports = getLevelScores;
