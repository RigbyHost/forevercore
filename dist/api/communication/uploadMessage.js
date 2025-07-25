'package net.fimastgd.forevercore.api.communication.uploadMessage';
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
 * Upload a message to another user
 * @param gameVersionStr - Game version
 * @param binaryVersionStr - Binary version
 * @param secretStr - Secret token
 * @param subjectStr - Message subject
 * @param toAccountIDStr - Recipient account ID
 * @param bodyStr - Message body
 * @param accountIDStr - Sender account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" on success, "-1" on failure
 */
const uploadMessage = async (gameVersionStr, binaryVersionStr, secretStr, subjectStr, toAccountIDStr, bodyStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        // Process and validate input parameters
        const gameVersion = await exploitPatch_1.default.remove(gameVersionStr);
        const binaryVersion = await exploitPatch_1.default.remove(binaryVersionStr);
        const secret = await exploitPatch_1.default.remove(secretStr);
        const subject = await exploitPatch_1.default.remove(subjectStr);
        const toAccountID = await exploitPatch_1.default.number(toAccountIDStr);
        const body = await exploitPatch_1.default.remove(bodyStr);
        // Authenticate sender
        const accID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Can't message yourself
        if (accID == toAccountID) {
            return "-1";
        }
        // Get sender's username
        const [userNameRows] = await db_proxy_1.default.query("SELECT userName FROM users WHERE extID = ? ORDER BY userName DESC", [accID]);
        const userName = userNameRows[0].userName;
        const id = await exploitPatch_1.default.remove(accountIDStr);
        const userID = await apiLib_1.default.getUserID(id);
        const uploadDate = Math.floor(Date.now() / 1000);
        // Check if sender is blocked by recipient
        const [blockedRows] = await db_proxy_1.default.query("SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?", [toAccountID, accID]);
        // Check recipient's message settings
        const [mSOnlyRows] = await db_proxy_1.default.query("SELECT mS FROM `accounts` WHERE accountID = ? AND mS > 0", [toAccountID]);
        // Check if users are friends
        const [friendRows] = await db_proxy_1.default.query("SELECT ID FROM `friendships` WHERE (person1 = ? AND person2 = ?) OR (person2 = ? AND person1 = ?)", [accID, toAccountID, accID, toAccountID]);
        // Friends-only messages check
        if (mSOnlyRows.length > 0 && mSOnlyRows[0].mS == 2) {
            console_api_1.default.Warn("main", "Failed to upload message: mSOnlyRows length more '0' and mSOnlyRows[0].mS equal '2' " +
                "at net.fimastgd.forevercore.api.communication.uploadMessage");
            return "-1";
        }
        else {
            // Verify message can be sent (not blocked, and respects message settings)
            if (blockedRows.length === 0 && (mSOnlyRows.length === 0 || friendRows.length > 0)) {
                // Insert message
                await db_proxy_1.default.query("INSERT INTO messages (subject, body, accID, userID, userName, toAccountID, secret, timestamp) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [subject, body, id, userID, userName, toAccountID, secret, uploadDate]);
                return "1";
            }
            else {
                throw new Error('Failed to upload message: submission requirements not met');
            }
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.communication.uploadMessage`);
        return "-1";
    }
};
exports.default = uploadMessage;
