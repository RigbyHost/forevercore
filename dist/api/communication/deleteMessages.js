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
 * Deletes messages from a GD user's inbox
 * @param messageIDStr - Single message ID to delete
 * @param messagesStr - Multiple message IDs to delete (comma-separated)
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteMessages = async (messageIDStr, messagesStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        // Process input parameters
        let messageID = messageIDStr ? await exploitPatch_1.default.remove(messageIDStr) : null;
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        if (messagesStr) {
            // Delete multiple messages
            const messages = await exploitPatch_1.default.numbercolon(messagesStr);
            // Delete messages sent by the user
            await db_proxy_1.default.query(`DELETE FROM messages WHERE messageID IN (${messages}) AND accID = ? LIMIT 10`, [accountID]);
            // Delete messages received by the user
            await db_proxy_1.default.query(`DELETE FROM messages WHERE messageID IN (${messages}) AND toAccountID = ? LIMIT 10`, [accountID]);
            console_api_1.default.Log("main", `Messages deleted`);
            return "1";
        }
        else {
            // Delete a single message
            await db_proxy_1.default.query("DELETE FROM messages WHERE messageID = ? AND accID = ? LIMIT 1", [messageID, accountID]);
            await db_proxy_1.default.query("DELETE FROM messages WHERE messageID = ? AND toAccountID = ? LIMIT 1", [messageID, accountID]);
            console_api_1.default.Log("main", `Message deleted`);
            return "1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.communication.deleteMessages`);
        return "-1";
    }
};
exports.default = deleteMessages;
