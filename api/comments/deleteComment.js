'package net.fimastgd.forevercore.api.comments.deleteComment';

const db = require("../../serverconf/db");
const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const deleteComment = async (accountIDStr, gjp2Str, gjpStr, commentIDStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const commentID = await ExploitPatch.remove(commentIDStr);
        const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const userID = await ApiLib.getUserID(accountID);
        let [result] = await db.execute("DELETE FROM comments WHERE commentID = ? AND userID = ? LIMIT 1", [commentID, userID]);
        if (result.affectedRows === 0) {
            const [rows] = await db.execute("SELECT users.extID FROM comments INNER JOIN levels ON levels.levelID = comments.levelID INNER JOIN users ON levels.userID = users.userID WHERE commentID = ?", [commentID]);
            const creatorAccID = rows[0]?.extID;
            if (creatorAccID == accountID || (await ApiLib.checkPermission(accountID, "actionDeleteComment")) == 1) {
                await db.execute("DELETE FROM comments WHERE commentID = ? LIMIT 1", [commentID]);
            }
        }
        ConsoleApi.Log("main", `Deleted comment. AccountID: ${accountID}, commentID: ${commentID}`);
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", "Failed to delete comment");
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteComment`);
        return "-1";
    }
};

module.exports = deleteComment;
