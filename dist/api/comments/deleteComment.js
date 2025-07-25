'package net.fimastgd.forevercore.api.comments.deleteComment';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Deletes a level comment
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param commentIDStr - Comment ID to delete
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteComment = async (accountIDStr, gjp2Str, gjpStr, commentIDStr, req) => {
    try {
        const commentID = await exploitPatch_1.default.remove(commentIDStr);
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const userID = await apiLib_1.default.getUserID(accountID);
        // Try to delete own comment first
        let [result] = await db_proxy_1.default.execute("DELETE FROM comments WHERE commentID = ? AND userID = ? LIMIT 1", [commentID, userID]);
        // If no rows affected, check if user has permission to delete comment or is level owner
        if (result.affectedRows === 0) {
            const [rows] = await db_proxy_1.default.execute(`SELECT users.extID 
         FROM comments 
         INNER JOIN levels ON levels.levelID = comments.levelID 
         INNER JOIN users ON levels.userID = users.userID 
         WHERE commentID = ?`, [commentID]);
            const creatorAccID = rows[0]?.extID;
            // Delete if user is level creator or has admin permission
            if (String(creatorAccID) === String(accountID) || (await apiLib_1.default.checkPermission(accountID, "actionDeleteComment")) === true) {
                await db_proxy_1.default.execute("DELETE FROM comments WHERE commentID = ? LIMIT 1", [commentID]);
            }
        }
        console_api_1.default.Log("main", `Deleted comment. AccountID: ${accountID}, commentID: ${commentID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", "Failed to delete comment");
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteComment`);
        return "-1";
    }
};
exports.default = deleteComment;
