'package net.fimastgd.forevercore.api.scores.getLevelScoresPlat';

const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getLevelScoresPlat = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		// trying new method
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);

		const levelID = await ExploitPatch.remove(req.body.levelID);
		const scores = {
			time: await ExploitPatch.number(req.body.time),
			points: await ExploitPatch.number(req.body.points)
		};
		const uploadDate = Math.floor(Date.now() / 1000);
		let lvlstr = "";
		const mode = req.body.mode == 1 ? "points" : "time";
		const order = mode == "time" ? "ASC" : "DESC";

		// UPDATING SCORE
		const [oldScoreRows] = await db.query(`SELECT ${mode} FROM platscores WHERE accountID = ? AND levelID = ?`, [accountID, levelID]);

		if (oldScoreRows.length == 0) {
			if (scores.time > 0) {
				await db.query("INSERT INTO platscores (accountID, levelID, time, timestamp) VALUES (?, ?, ?, ?)", [accountID, levelID, scores.time, uploadDate]);
			}
		} else {
			const oldPercent = oldScoreRows[0][mode];
			if (((mode == "time" && oldPercent > scores.time) || (mode == "points" && oldPercent < scores.points)) && scores.time > 0) {
				await db.query(`UPDATE platscores SET ${mode}=?, timestamp=? WHERE accountID=? AND levelID=?`, [scores[mode], uploadDate, accountID, levelID]);
			}
		}

		// GETTING SCORES
		const type = req.body.type || 1;
		let query, queryArgs;

		switch (parseInt(type)) {
			case 0:
				const friends = await ApiLib.getFriends(accountID);
				friends.push(accountID);
				const friendsStr = friends.join(",");
				query = `SELECT * FROM platscores WHERE levelID = ? AND accountID IN (${friendsStr}) AND time > 0 ORDER BY ${mode} ${order}`;
				queryArgs = [levelID];
				break;
			case 1:
				query = `SELECT * FROM platscores WHERE levelID = ? AND time > 0 ORDER BY ${mode} ${order}`;
				queryArgs = [levelID];
				break;
			case 2:
				query = `SELECT * FROM platscores WHERE levelID = ? AND timestamp > ? AND time > 0 ORDER BY ${mode} ${order}`;
				queryArgs = [levelID, uploadDate - 604800];
				break;
			default:
				return "-1";
		}

		const [scores2] = await db.query(query, queryArgs);

		let x = 0;
		for (const score of scores2) {
			const extID = score.accountID;
			const [userRows] = await db.query("SELECT userName, userID, icon, color1, color2, color3, iconType, special, extID, isBanned FROM users WHERE extID = ?", [extID]);
			const user = userRows[0];
			if (user.isBanned != 0) continue;
			x++;
			const time = new Date(score.timestamp * 1000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "").replace(/:/, ".");
			const scoreType = score[mode];
			lvlstr += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.color3}:16:${extID}:3:${scoreType}:6:${x}:42:${time}|`;
		}
		
		ConsoleApi.Log("main", `Received platformer level scores by accountID: ${accountID}`);
		return lvlstr.slice(0, -1);
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getLevelScoresPlat`);
		return "-1";
	}
};

module.exports = getLevelScoresPlat;
