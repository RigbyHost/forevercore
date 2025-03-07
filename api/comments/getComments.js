'package net.fimastgd.forevercore.api.comments.getComments';

const db = require("../../serverconf/db");
const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getComments = async (binaryVersionStr, gameVersionStr, modeStr, countStr, pageStr, levelIDStr, userIDStr) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const commentstring = [];
        const userstring = [];
        let users = new Set();
        //let users = [];
        const binaryVersion = binaryVersionStr ? await ExploitPatch.remove(binaryVersionStr) : 0;
        const gameVersion = gameVersionStr ? await ExploitPatch.remove(gameVersionStr) : 0;
        const mode = modeStr ? await ExploitPatch.remove(modeStr) : 0;
        const count = countStr && !isNaN(countStr) ? await ExploitPatch.remove(countStr) : 10;
        const page = pageStr ? await ExploitPatch.remove(pageStr) : 0;
        const commentpage = page * count;
        const modeColumn = mode == 0 ? "commentID" : "likes";
        let filterColumn, filterToFilter, displayLevelID, filterID, userListJoin, userListWhere, userListColumns;
        if (levelIDStr) {
            filterColumn = "levelID";
            filterToFilter = "";
            displayLevelID = false;
            filterID = await ExploitPatch.remove(levelIDStr);
            userListJoin = userListWhere = userListColumns = "";
        } else if (userIDStr) {
            filterColumn = "userID";
            filterToFilter = "comments.";
            displayLevelID = true;
            filterID = await ExploitPatch.remove(userIDStr);
            userListColumns = ", levels.unlisted";
            userListJoin = "INNER JOIN levels ON comments.levelID = levels.levelID";
            userListWhere = "AND levels.unlisted = 0";
        } else {
            return "-1";
        }
        const [countResult] = await db.query(`SELECT count(*) as count FROM comments ${userListJoin} WHERE ${filterToFilter}${filterColumn} = ? ${userListWhere}`, [filterID]);
        const commentcount = countResult[0].count;
        if (commentcount == 0) {
            return "-2";
        }
        const [result] = await db.query(`SELECT comments.levelID, comments.commentID, comments.timestamp, comments.comment, comments.userID, comments.likes, comments.isSpam, comments.percent, users.userName, users.icon, users.color1, users.color2, users.iconType, users.special, users.extID FROM comments LEFT JOIN users ON comments.userID = users.userID ${userListJoin} WHERE comments.${filterColumn} = ? ${userListWhere} ORDER BY comments.${modeColumn} DESC LIMIT ? OFFSET ?`, [
            filterID,
            parseInt(count),
            commentpage
        ]);
        const visiblecount = result.length;
        for (const comment1 of result) {
            if (comment1.commentID) {
                let uploadDate = new Date(comment1.timestamp * 1000).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                uploadDate = uploadDate.replace(/,/g, "");
                uploadDate = uploadDate.replace(/:/g, ".");
                const commentText = gameVersion < 20 ? Buffer.from(comment1.comment, "base64").toString() : comment1.comment;
                let commentParts = [];
                if (displayLevelID) commentParts.push(`1~${comment1.levelID}`);
                commentParts.push(`2~${commentText}`, `3~${comment1.userID}`, `4~${comment1.likes}`, `5~0`, `7~${comment1.isSpam}`, `9~${uploadDate}`, `6~${comment1.commentID}`, `10~${comment1.percent}`);
                if (comment1.userName) {
                    const extID = !isNaN(comment1.extID) ? comment1.extID : 0;
                    if (binaryVersion > 31) {
                        const badge = await ApiLib.getMaxValuePermission(extID, "modBadgeLevel");
                        // ConsoleApi.Debug("main", `Badge: ${badge}`);
                        const colorString = badge > 0 ? `~12~${await ApiLib.getAccountCommentColor(extID)}` : "";
						// ConsoleApi.Debug("main", `cs: ${colorString}`);
                        commentParts.push(`11~${badge}${colorString}:1~${comment1.userName}~7~1~9~${comment1.icon}~10~${comment1.color1}~11~${comment1.color2}~14~${comment1.iconType}~15~${comment1.special}~16~${extID}`);
                    } else if (!users.has(comment1.userID)) {
                        users.add(comment1.userID);
                        userstring.push(`${comment1.userID}:${comment1.userName}:${extID}`);
                    }
                }
                commentstring.push(commentParts.join("~"));
            }
        }
        let response = commentstring.join("|");
        if (binaryVersion < 32) {
            response += `#${userstring.join("|")}`;
        }
        response += `#${commentcount}:${commentpage}:${visiblecount}`;
        ConsoleApi.Log("main", `Received ${commentcount} comments, page ${commentpage}`);
        return response;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.getComments`);
        return "-1";
    }
};

module.exports = getComments;
