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
 * Gets messages for a GD user's inbox
 * @param pageStr - Page number
 * @param getSentStr - Whether to get sent messages (1) or received messages (0)
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns Formatted messages string, "-1" if error, "-2" if no messages
 */
const getMessages = async (pageStr, getSentStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        let msgstring = "";
        const toAccountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const page = await exploitPatch_1.default.remove(pageStr);
        const offset = parseInt(page) * 10;
        let query, countquery, getSent;
        // Determine if getting sent or received messages
        if (!getSentStr || getSentStr != '1') {
            query = `SELECT * FROM messages WHERE toAccountID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
            countquery = "SELECT count(*) as count FROM messages WHERE toAccountID = ?";
            getSent = 0;
        }
        else {
            query = `SELECT * FROM messages WHERE accID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
            countquery = "SELECT count(*) as count FROM messages WHERE accID = ?";
            getSent = 1;
        }
        // Get messages
        const [result] = await db_proxy_1.default.query(query, [toAccountID]);
        // Get message count
        const [countResult] = await db_proxy_1.default.query(countquery, [toAccountID]);
        const msgcount = countResult[0]["count(*)"];
        if (msgcount == 0) {
            return "-2";
        }
        // Process each message
        for (const message1 of result) {
            if (message1.messageID !== undefined) {
                // Format date
                const uploadDate = new Date(message1.timestamp * 1000)
                    .toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                })
                    .replace(/,/, "").replace(/:/, ".");
                // Get the relevant account ID (sender or receiver based on view)
                const accountID = getSent == 1 ? message1.toAccountID : message1.accID;
                // Get user data
                const [userResult] = await db_proxy_1.default.query("SELECT * FROM users WHERE extID = ?", [accountID]);
                const result12 = userResult[0];
                // Build message string
                msgstring += `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${message1.messageID}:4:${message1.subject}:8:${message1.isNew}:9:${getSent}:7:${uploadDate}|`;
            }
        }
        // Remove trailing pipe and add metadata
        msgstring = msgstring.slice(0, -1);
        console_api_1.default.Log("main", `Received messages: ${msgcount}`);
        return `${msgstring}#${msgcount}:${offset}:10`;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.communication.getMessages`);
        return "-1";
    }
};
exports.default = getMessages;
