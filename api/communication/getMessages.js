'package net.fimastgd.forevercore.api.communication.getMessages';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getMessages = async (pageStr, getSentStr, accountIDStr, gjp2Str, gjpStr, req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		let msgstring = "";
		const toAccountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
		const page = await ExploitPatch.remove(pageStr);
		const offset = page * 10;
		let query, countquery, getSent;
		if (!getSentStr || getSentStr != 1) {
			query = `SELECT * FROM messages WHERE toAccountID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
			countquery = "SELECT count(*) FROM messages WHERE toAccountID = ?";
			getSent = 0;
		} else {
			query = `SELECT * FROM messages WHERE accID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
			countquery = "SELECT count(*) FROM messages WHERE accID = ?";
			getSent = 1;
		}
		const [result] = await db.query(query, [toAccountID]);
		const [countResult] = await db.query(countquery, [toAccountID]);
		const msgcount = countResult[0]["count(*)"];
		if (msgcount == 0) {
			return "-2";
		}
		for (const message1 of result) {
			if (message1.messageID !== "") {
				const uploadDate = new Date(message1.timestamp * 1000)
					.toLocaleString("ru-RU", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: false
					})
					.replace(/,/, "").replace(/:/, ".");
				const accountID = getSent == 1 ? message1.toAccountID : message1.accID;
				const [userResult] = await db.query("SELECT * FROM users WHERE extID = ?", [accountID]);
				const result12 = userResult[0];
				msgstring += `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${message1.messageID}:4:${message1.subject}:8:${message1.isNew}:9:${getSent}:7:${uploadDate}|`;
			}
		}
		msgstring = msgstring.slice(0, -1);
		ConsoleApi.Log("main", `Received messages: ${msgcount}`);
		return `${msgstring}#${msgcount}:${offset}:10`;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.getMessages`);
		return "-1";
	}
};

module.exports = getMessages;
