'package net.fimastgd.forevercore.api.comments.deleteAccountComment';

const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const deleteAccountComment = async (commentIDStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
    const dateNow = () => {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    };
    const commentID = await ExploitPatch.remove(commentIDStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const userID = await ApiLib.getUserID(accountID);
    const permission = await ApiLib.checkPermission(accountID, "actionDeleteComment");
    if (permission === 1) {
        const query = `DELETE FROM acccomments WHERE commentID = ? LIMIT 1`;
        await db.query(query, [commentID]);
    } else {
        const query = `DELETE FROM acccomments WHERE commentID = ? AND userID = ? LIMIT 1`;
        await db.query(query, [commentID, userID]);
    }
    ConsoleApi.Log("main", `Deleted account comment. AccountID: ${accountIDStr}, commentID: ${commentIDStr}`);
    return "1";
    } catch (error) {
	ConsoleApi.Error("main", "Failed to get account comments");
	ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteAccountComment`);
	return "-1";
    }
};

module.exports = deleteAccountComment;