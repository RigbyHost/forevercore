'package net.fimastgd.forevercore.api.comments.deleteAccountComment';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Deletes an account comment
 * @param commentIDStr - Comment ID to delete
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteAccountComment = async (commentIDStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        // Process parameters
        const commentID = await exploitPatch_1.default.remove(commentIDStr);
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const userID = await apiLib_1.default.getUserID(accountID);
        // Check permission to delete comment
        const permission = await apiLib_1.default.checkPermission(accountID, "actionDeleteComment");
        if (typeof (permission) === "number" && permission === 1) {
            // Admin can delete any comment
            const query = `DELETE FROM acccomments WHERE commentID = ? LIMIT 1`;
            await db_proxy_1.default.query(query, [commentID]);
        }
        else {
            // User can only delete their own comments
            const query = `DELETE FROM acccomments WHERE commentID = ? AND userID = ? LIMIT 1`;
            await db_proxy_1.default.query(query, [commentID, userID]);
        }
        console_api_1.default.Log("main", `Deleted account comment. AccountID: ${accountIDStr}, commentID: ${commentIDStr}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", "Failed to get account comments");
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteAccountComment`);
        return "-1";
    }
};
exports.default = deleteAccountComment;
