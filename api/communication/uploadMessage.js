'package net.fimastgd.forevercore.api.communication.uploadMessage';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");

const ConsoleApi = require("../../modules/console-api");

const uploadMessage = async (gameVersionStr, binaryVersionStr, secretStr, subjectStr, toAccountIDStr, bodyStr, accountIDStr, gjp2Str, gjpStr, req) => {
	try {
	const gameVersion = await ExploitPatch.remove(gameVersionStr);
	const binaryVersion = await ExploitPatch.remove(binaryVersionStr);
	const secret = await ExploitPatch.remove(secretStr);
	const subject = await ExploitPatch.remove(subjectStr);
	const toAccountID = await ExploitPatch.number(toAccountIDStr);
	const body = await ExploitPatch.remove(bodyStr);
	const accID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
	if (accID == toAccountID) {
		return "-1";
	}
	const [userNameRows] = await db.query("SELECT userName FROM users WHERE extID = ? ORDER BY userName DESC", [accID]);
	const userName = userNameRows[0].userName;
	const id = await ExploitPatch.remove(accountIDStr);
	const register = 1;
	const userID = await ApiLib.getUserID(id);
	const uploadDate = Math.floor(Date.now() / 1000);
	const [blockedRows] = await db.query("SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?", [toAccountID, accID]);
	const [mSOnlyRows] = await db.query("SELECT mS FROM `accounts` WHERE accountID = ? AND mS > 0", [toAccountID]);
	const [friendRows] = await db.query("SELECT ID FROM `friendships` WHERE (person1 = ? AND person2 = ?) OR (person2 = ? AND person1 = ?)", [accID, toAccountID, accID, toAccountID]);
	if (mSOnlyRows.length > 0 && mSOnlyRows[0].mS == 2) {
		ConsoleApi.Warn("main", `Failed to upload message: mSOnlyRows length more '0' and mSOnlyRows[0].mS equal '2' at net.fimastgd.forevercore.api.communication.uploadMessage`);
		return "-1";
	} else {
		if (blockedRows.length === 0 && (mSOnlyRows.length === 0 || friendRows.length > 0)) {
			await db.query("INSERT INTO messages (subject, body, accID, userID, userName, toAccountID, secret, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [subject, body, id, userID, userName, toAccountID, secret, uploadDate]);
			return "1";
		} else {
			throw new Error('Failed to upload message: submission requirements not met');
			return "-1";
		}
	}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.uploadMessage`);
		return "-1";
	}
};

module.exports = uploadMessage;
