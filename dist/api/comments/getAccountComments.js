'package net.fimastgd.forevercore.api.comments.getAccountComments';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Get account comments for a user
 * @param accountIDStr - Account ID string
 * @param pageStr - Page number string
 * @param req - Express request object
 * @returns Formatted comments string
 */
const getAccountComments = async (accountIDStr, pageStr, req) => {
    try {
        let accountID;
        // ВАЖНО: Обработка краевого случая с массивом
        if (Array.isArray(accountIDStr)) {
            console_api_1.default.Warn("main", "Array instead of Int detected, trying to offset array...");
            accountID = await exploitPatch_1.default.remove(accountIDStr[1]);
        }
        else {
            accountID = await exploitPatch_1.default.remove(accountIDStr);
        }
        // Parse page number
        const page = await exploitPatch_1.default.remove(pageStr);
        const commentpage = parseInt(page) * 10;
        // Get user ID for the account
        const userID = await apiLib_1.default.getUserID(accountID);
        const userIDInt = parseInt(userID.toString(), 10);
        const commentpageInt = parseInt(commentpage.toString(), 10);
        // Query database for comments
        const query = `
            SELECT comment, userID, likes, isSpam, commentID, timestamp
            FROM acccomments
            WHERE userID = ?
            ORDER BY timestamp DESC
                LIMIT 10 OFFSET ?
        `;
        const [rows] = await db_proxy_1.default.execute(query, [userIDInt, commentpageInt.toString()]);
        // Return early if no comments found
        if (rows.length === 0) {
            return "#0:0:0";
        }
        // Build comment string
        let commentstring = "";
        for (const comment1 of rows) {
            if (comment1.commentID) {
                // Format date for display
                const timestampInSeconds = comment1.timestamp;
                const timestampInMilliseconds = timestampInSeconds * 1000;
                const date = new Date(timestampInMilliseconds);
                const uploadDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                // Build comment data string
                commentstring += `2~${comment1.comment}~3~${comment1.userID}~4~${comment1.likes}~5~0~7~${comment1.isSpam}~9~${uploadDate}~6~${comment1.commentID}|`;
            }
        }
        // Remove trailing pipe
        commentstring = commentstring.slice(0, -1);
        // Get total comment count
        const countquery = "SELECT COUNT(*) FROM acccomments WHERE userID = ?";
        const [countResult] = await db_proxy_1.default.execute(countquery, [userID]);
        const commentcount = countResult[0]["COUNT(*)"];
        console_api_1.default.Log("main", `Received account comments. accountID: ${accountID}`);
        return `${commentstring}#${commentcount}:${commentpage}:10`;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.comments.getAccountComments`);
        return "-1";
    }
};
exports.default = getAccountComments;
