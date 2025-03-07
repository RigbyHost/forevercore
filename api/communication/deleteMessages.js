'package net.fimastgd.forevercore.api.communication.deleteMessages';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const deleteMessages = async (messageIDStr, messagesStr, accountIDStr, gjp2Str, gjpStr, req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		let messageID = messageIDStr ? await ExploitPatch.remove(messageIDStr) : null;
		const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);

		if (messagesStr) {
			const messages = await ExploitPatch.numbercolon(messagesStr);
			await db.query(`DELETE FROM messages WHERE messageID IN (${messages}) AND accID = ? LIMIT 10`, [accountID]);
			await db.query(`DELETE FROM messages WHERE messageID IN (${messages}) AND toAccountID = ? LIMIT 10`, [accountID]);
			ConsoleApi.Log("main", `Message deleted`);
			return "1";
		} else {
			await db.query("DELETE FROM messages WHERE messageID = ? AND accID = ? LIMIT 1", [messageID, accountID]);
			await db.query("DELETE FROM messages WHERE messageID = ? AND toAccountID = ? LIMIT 1", [messageID, accountID]);
			ConsoleApi.Log("main", `Message deleted`);
			return "1";
		}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.deleteMessages`);
		return "-1";
	}
};

module.exports = deleteMessages;
