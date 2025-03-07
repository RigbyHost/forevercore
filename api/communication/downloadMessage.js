'package net.fimastgd.forevercore.api.communication.downloadMessage';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const downloadMessage = async (messageIDStr, accountIDStr, gjp2Str, gjpStr, isSenderStr, req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		let accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
		const messageID = await ExploitPatch.remove(messageIDStr);
		const [messages] = await db.query("SELECT accID, toAccountID, timestamp, userName, messageID, subject, isNew, body FROM messages WHERE messageID = ? AND (accID = ? OR toAccountID = ?) LIMIT 1", [messageID, accountID, accountID]);
		if (messages.length === 0) {
			return "-1";
		}
		const result = messages[0];
		let isSender;
		if (!isSenderStr) {
			await db.query("UPDATE messages SET isNew=1 WHERE messageID = ? AND toAccountID = ?", [messageID, accountID]);
			accountID = result.accID;
			isSender = 0;
		} else {
			isSender = 1;
			accountID = result.toAccountID;
		}
		const [users] = await db.query("SELECT userName, userID, extID FROM users WHERE extID = ?", [accountID]);
		const result12 = users[0];
		const uploadDate = new Date(result.timestamp * 1000)
			.toLocaleString("ru-RU", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			})
			.replace(/:/g, ".")
			.replace(",", "");
		const response = `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${result.messageID}:4:${result.subject}:8:${result.isNew}:9:${isSender}:5:${result.body}:7:${uploadDate}`;
		ConsoleApi.Log("main", `Message downloaded`);
		return response;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.downloadMessage`);
		return "-1";
	}
};

module.exports = downloadMessage;
