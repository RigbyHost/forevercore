'package net.fimastgd.forevercore.api.comments.getAccountComments';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getAccountComments = async (accountIDStr, pageStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    let accountID;
	try {
    // ROBERT LOPATA MOMENT
    if (Array.isArray(accountIDStr)) {
        ConsoleApi.Warn("main", `Array instead of Int detected, trying to offset array...`);
        accountID = await ExploitPatch.remove(accountIDStr[1]);
    } else {
        accountID = await ExploitPatch.remove(accountIDStr);
    }
    let page = await ExploitPatch.remove(pageStr);
    const commentpage = page * 10;
    const userID = await ApiLib.getUserID(accountID);
    let commentpageInt = await parseInt(commentpage, 10);
    let userIDInt = await parseInt(userID, 10);

    const query = `
        SELECT comment, userID, likes, isSpam, commentID, timestamp
        FROM acccomments
        WHERE userID = ?
        ORDER BY timestamp DESC
        LIMIT 10 OFFSET ?
    `;
    // const [rows] = await db.execute(query, [String(userIDInt), String(commentpageInt)]);
    const [rows] = await db.execute(query, [userIDInt, String(commentpageInt)]);
    if (rows.length === 0) {
       // console.warn(c.yellow(`[${dateNow()}] [main/WARN]: Account comments not found on current accountID. ID: ${accountID}`));
        return "#0:0:0";
    }
    let commentstring = "";
    for (const comment1 of rows) {
        if (comment1.commentID) {
            const timestampInSeconds = comment1.timestamp;
            const timestampInMilliseconds = timestampInSeconds * 1000;
            const date = new Date(timestampInMilliseconds);
            const uploadDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

            commentstring += `2~${comment1.comment}~3~${comment1.userID}~4~${comment1.likes}~5~0~7~${comment1.isSpam}~9~${uploadDate}~6~${comment1.commentID}|`;
        }
    }
    commentstring = commentstring.slice(0, -1);

    const countquery = "SELECT COUNT(*) FROM acccomments WHERE userID = ?";
    const [countResult] = await db.execute(countquery, [userID]);
    const commentcount = countResult[0]["COUNT(*)"];
    ConsoleApi.Log("main", `Received account comments. accountID: ${accountID}`);
    return `${commentstring}#${commentcount}:${commentpage}:10`;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.getAccountComments`);
		return "-1";
	}
};
module.exports = getAccountComments;
