'package net.fimastgd.forevercore.api.comments.uploadComment';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const commandLib_1 = __importDefault(require("../lib/commandLib"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Uploads a comment to a level in Geometry Dash
 * @param userNameStr - Username
 * @param gameVersionStr - Game version
 * @param commentStr - Comment content
 * @param levelIDStr - Level ID to comment on
 * @param percentStr - Completion percentage
 * @param udidStr - Device ID
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadComment = async (userNameStr, gameVersionStr, commentStr, levelIDStr, percentStr, udidStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        const userName = userNameStr ? await exploitPatch_1.default.remove(userNameStr) : "";
        const gameVersion = gameVersionStr ? parseInt(await exploitPatch_1.default.number(gameVersionStr)) : 0;
        let comment = await exploitPatch_1.default.remove(commentStr);
        comment = gameVersion < 20 ? Buffer.from(comment).toString("base64") : comment;
        const levelID = (parseInt(levelIDStr) < 0 ? "-" : "") + (await exploitPatch_1.default.number(levelIDStr));
        const percent = percentStr ? await exploitPatch_1.default.remove(percentStr) : 0;
        let id = await apiLib_1.default.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        const idNum = parseInt(id);
        const register = !isNaN(idNum);
        const userID = await apiLib_1.default.getUserID(id, userName);
        const uploadDate = Math.floor(Date.now() / 1000);
        const decodecomment = Buffer.from(comment, "base64").toString("utf-8");
        // Проверяем, является ли комментарий командой
        const commandResult = await commandLib_1.default.doCommands(id, decodecomment, levelID);
        if (commandResult === true) {
            const result = gameVersion > 20 ? "temp_0_<cg>Command completed successfully!</c>" : "-1";
            return result;
        }
        else if (commandResult === "NO") {
            const resultNO = gameVersion > 20 ? "temp_0_<cr>No permissions</c>" : "-1";
            return resultNO;
        }
        if (id != "" && comment != "") {
            // Добавляем комментарий в базу данных, включая поле progresses
            await db_proxy_1.default.execute("INSERT INTO comments (userName, comment, levelID, userID, timeStamp, percent, isSpam) VALUES (?, ?, ?, ?, ?, ?, ?)", [userName, comment, levelID, userID, uploadDate, percent, 0] // Добавляем пустое значение для progresses
            );
            // Если комментарий содержит процент прохождения, обновляем статистику
            if (register && parseInt(percent.toString()) != 0) {
                const [rows] = await db_proxy_1.default.execute("SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ?", [id, levelID]);
                if (rows.length == 0) {
                    await db_proxy_1.default.execute("INSERT INTO levelscores (accountID, levelID, percent, uploadDate) VALUES (?, ?, ?, ?)", [id, levelID, percent, uploadDate]);
                }
                else if (rows[0].percent < percent) {
                    await db_proxy_1.default.execute("UPDATE levelscores SET percent = ?, uploadDate = ? WHERE accountID = ? AND levelID = ?", [percent, uploadDate, id, levelID]);
                }
            }
            console_api_1.default.Log("main", `Uploaded comment to level ${levelID} by ${userName}: ${comment}`);
            return "1";
        }
        else {
            console_api_1.default.Warn("main", `Failed upload comment to level ${levelID} by ${userName}: ${comment}`);
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadComment`);
        return "-1";
    }
};
exports.default = uploadComment;
