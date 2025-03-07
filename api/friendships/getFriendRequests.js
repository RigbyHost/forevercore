'package net.fimastgd.forevercore.api.friendships.getFriendRequests';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getFriendRequests = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		let reqstring = "";
		const getSent = !req.body.getSent ? 0 : await ExploitPatch.remove(req.body.getSent);
		const bcgjp = req.body.gameVersion > 21 ? req.body.gjp2 : req.body.gjp; // Backwards Compatible GJP
		if (!req.body.accountID || !req.body.page || isNaN(req.body.page) || !bcgjp) {
			ConsoleApi.Debug("main", "Friend requests error: POST params not found ");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const page = await ExploitPatch.number(req.body.page);
		const offset = page * 10;

		let query, countquery;
		if (getSent == 0) {
			query = "SELECT accountID, toAccountID, uploadDate, ID, comment, isNew FROM friendreqs WHERE toAccountID = ? LIMIT 10 OFFSET ?";
			countquery = "SELECT count(*) as count FROM friendreqs WHERE toAccountID = ?";
		} else if (getSent == 1) {
			query = "SELECT * FROM friendreqs WHERE accountID = ? LIMIT 10 OFFSET ?";
			countquery = "SELECT count(*) as count FROM friendreqs WHERE accountID = ?";
		} else {
			ConsoleApi.Log("main", "Friend requests not received: getSent not equal '0' or '1'");
			return "-1";
		}
		const [result] = await db.query(query, [accountID, offset]);
		const [countResult] = await db.query(countquery, [accountID]);
		const reqcount = countResult[0].count;
		if (reqcount == 0) {
			ConsoleApi.Log("main", "Friend request not received: reqcount is 0");
			return "-2";
		}
		for (const request of result) {
			const requester = getSent == 0 ? request.accountID : request.toAccountID;
			const [userResult] = await db.query("SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID = ?", [requester]);
			const user = userResult[0];
			const uploadTime = new Date(request.uploadDate * 1000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "").replace(/:/g, ".");
			const extid = !isNaN(user.extID) ? user.extID : 0;
			reqstring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:32:${request.ID}:35:${request.comment}:41:${request.isNew}:37:${uploadTime}|`;
		}
		reqstring = reqstring.slice(0, -1);
		ConsoleApi.Log("main", `Received friend requests`);
		return `${reqstring}#${reqcount}:${offset}:10`;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getFriendRequests`);
		return "-1";
	}
};

module.exports = getFriendRequests;
