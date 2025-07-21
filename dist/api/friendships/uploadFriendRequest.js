"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Uploads a friend request in Geometry Dash
 * @param accountIDStr - Account ID of sender
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param toAccountIDStr - Account ID of receiver
 * @param commentStr - Friend request message
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadFriendRequest = async (accountIDStr, gjp2Str, gjpStr, toAccountIDStr, commentStr, req) => {
    try {
        if (!toAccountIDStr) {
            console_api_1.default.Log("main", `Failed to upload friend request: toAccountIDStr not found`);
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const toAccountID = await exploitPatch_1.default.number(toAccountIDStr);
        // Prevent self-friending
        if (toAccountID == accountID) {
            console_api_1.default.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: toAccountID equal accountID`);
            return "-1";
        }
        const comment = await exploitPatch_1.default.remove(commentStr);
        const uploadDate = Math.floor(Date.now() / 1000);
        // Check if user is blocked
        const [blocked] = await db_proxy_1.default.query("SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?", [toAccountID, accountID]);
        // Check if receiver has friends-only setting
        const [frSOnly] = await db_proxy_1.default.query("SELECT frS FROM `accounts` WHERE accountID = ? AND frS = 1", [toAccountID]);
        // Check if request already exists
        const [existingRequests] = await db_proxy_1.default.query("SELECT count(*) as count FROM friendreqs WHERE (accountID = ? AND toAccountID = ?) OR (toAccountID = ? AND accountID = ?)", [accountID, toAccountID, accountID, toAccountID]);
        // Only create request if no existing requests, not blocked, and allowed by settings
        if (existingRequests[0].count == 0 && !blocked.length && !frSOnly.length) {
            await db_proxy_1.default.query("INSERT INTO friendreqs (accountID, toAccountID, comment, uploadDate) VALUES (?, ?, ?, ?)", [accountID, toAccountID, comment, uploadDate]);
            console_api_1.default.Log("main", `Uploaded friend request to ${toAccountID} from ${accountID}`);
            return "1";
        }
        else {
            console_api_1.default.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: existingRequests[0].count equal '0' and blocked.length not found and frSOnly.length not found`);
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.uploadFriendRequest`);
        return "-1";
    }
};
exports.default = uploadFriendRequest;
