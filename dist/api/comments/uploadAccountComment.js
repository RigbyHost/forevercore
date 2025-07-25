'package net.fimastgd.forevercore.api.comments.uploadAccountComment';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Uploads a comment to a user's account page
 * @param userNameStr - Username
 * @param accountIDStr - Account ID
 * @param commentStr - Comment content
 * @param gjpStr - GJP hash
 * @param gjp2Str - GJP2 hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadAccountComment = async (userNameStr, accountIDStr, commentStr, gjpStr, gjp2Str, req) => {
    try {
        const userName = await exploitPatch_1.default.remove(userNameStr);
        const comment = await exploitPatch_1.default.remove(commentStr);
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const userID = await apiLib_1.default.getUserID(accountID, userName);
        if (accountID && comment) {
            // Decode comment for processing
            const decodeComment = Buffer.from(comment, "base64").toString("utf-8");
            const uploadDate = Math.floor(Date.now() / 1000);
            // Insert comment into database
            const query = `
        INSERT INTO acccomments (userName, comment, userID, timeStamp)
        VALUES (?, ?, ?, ?)
      `;
            await db_proxy_1.default.execute(query, [userName, comment, userID, uploadDate]);
            console_api_1.default.Log("main", `Uploaded account comment ${userName}: ${comment}`);
            return "1";
        }
        else {
            console_api_1.default.Warn("main", `Failed to upload account comment: ${userName}`);
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadAccountComment`);
        return "-1";
    }
};
exports.default = uploadAccountComment;
