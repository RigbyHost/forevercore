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
 * Downloads a message from a GD user's inbox
 * @param messageIDStr - Message ID to download
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param isSenderStr - Whether to get sender's view of message
 * @param req - Express request
 * @returns Formatted message string or "-1" if failed
 */
const downloadMessage = async (messageIDStr, accountIDStr, gjp2Str, gjpStr, isSenderStr, req) => {
    try {
        let accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const messageID = await exploitPatch_1.default.remove(messageIDStr);
        // Get message data
        const [messages] = await db_proxy_1.default.query(`SELECT accID, toAccountID, timestamp, userName, messageID, subject, isNew, body 
       FROM messages 
       WHERE messageID = ? AND (accID = ? OR toAccountID = ?) 
       LIMIT 1`, [messageID, accountID, accountID]);
        if (messages.length === 0) {
            return "-1";
        }
        const result = messages[0];
        let isSender;
        // Handle sender vs receiver view
        if (!isSenderStr) {
            // Mark message as read
            await db_proxy_1.default.query("UPDATE messages SET isNew=1 WHERE messageID = ? AND toAccountID = ?", [messageID, accountID]);
            accountID = String(result.accID);
            isSender = 0;
        }
        else {
            isSender = 1;
            accountID = String(result.toAccountID);
        }
        // Get user data
        const [users] = await db_proxy_1.default.query("SELECT userName, userID, extID FROM users WHERE extID = ?", [accountID]);
        const result12 = users[0];
        // Format date
        const uploadDate = new Date(result.timestamp * 1000)
            .toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        })
            .replace(/:/g, ".")
            .replace(",", "");
        // Format response
        const response = `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${result.messageID}:4:${result.subject}:8:${result.isNew}:9:${isSender}:5:${result.body}:7:${uploadDate}`;
        console_api_1.default.Log("main", `Message downloaded`);
        return response;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.communication.downloadMessage`);
        return "-1";
    }
};
exports.default = downloadMessage;
