'package net.fimastgd.forevercore.api.comments.uploadAccountComment';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");
const uploadAccountComment = async (userNameStr, accountIDStr, commentStr, gjpStr, gjp2Str, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    var userName = await ExploitPatch.remove(userNameStr);
    try {
        var comment = await ExploitPatch.remove(commentStr);
        var accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        var userID = await ApiLib.getUserID(accountID, userName);

        if (accountID && comment) {
            const decodeComment = Buffer.from(comment, "base64").toString("utf-8");
            const uploadDate = Math.floor(Date.now() / 1000);
            const query = `
                INSERT INTO acccomments (userName, comment, userID, timeStamp)
                VALUES (?, ?, ?, ?)
            `;
            await db.execute(query, [userName, comment, userID, uploadDate]);
            ConsoleApi.Log("main", `Uploaded account comment ${userName}: ${comment}`);
            return "1";
        } else {
			ConsoleApi.Warn("main", `Failed to upload account comment: ${userName}`);
            return "-1";
        }
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadAccountComment`);
        return "-1";
    }
};

module.exports = uploadAccountComment;
