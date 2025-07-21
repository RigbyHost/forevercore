"package net.fimastgd.forevercore.api.accounts.login";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generatePass_1 = __importDefault(require("../lib/generatePass"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const db_1 = __importDefault(require("../../serverconf/db"));
/**
 * Handles user login for Geometry Dash accounts
 * @param userNameOr - Username provided by user
 * @param udidOr - Unique device ID if provided
 * @param passwordOr - Password (if using standard auth)
 * @param gjp2Or - GJP2 hash (if using GJP2 auth)
 * @param req - Express request object
 * @returns Promise resolving to login result string
 */
const loginAccount = async (gdpsid, userNameOr, udidOr, passwordOr, gjp2Or, req) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        // Get client IP
        const ip = await apiLib_1.default.getIP(req);
        // Process input parameters
        const udid = udidOr ? await exploitPatch_1.default.remove(udidOr) : "";
        const userName = userNameOr ? await exploitPatch_1.default.remove(userNameOr) : "";
        // Check if username exists
        const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
        if (rows.length === 0) {
            console_api_1.default.Log("main", `Failed login to account (Username is invalid): ${userName}`);
            return "-1";
        }
        const id = rows[0].accountID;
        // Validate credentials
        let pass = 0;
        if (passwordOr) {
            pass = await generatePass_1.default.isValidUsrname(userName, passwordOr, req);
        }
        else if (gjp2Or) {
            pass = await generatePass_1.default.isGJP2ValidUsrname(userName, gjp2Or, req);
        }
        if (pass === 1) {
            // Get user ID or create a new user
            const [userRows] = await db.execute("SELECT userID FROM users WHERE extID = ?", [id]);
            let userID;
            if (userRows.length > 0) {
                userID = userRows[0].userID;
            }
            else {
                // Create new user entry
                const [result] = await db.execute("INSERT INTO users (isRegistered, extID, userName) VALUES (1, ?, ?)", [
                    id,
                    userName
                ]);
                userID = result.insertId;
            }
            // Log the login action
            await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES (?, ?, ?, ?)", [
                "2",
                userName,
                Math.floor(Date.now() / 1000),
                ip
            ]);
            console_api_1.default.Log("main", `Logged to account: ${userName}`);
            // Handle UDID transfer if needed
            if (!isNaN(parseInt(udid))) {
                try {
                    const [oldUserRows] = await db.execute("SELECT userID FROM users WHERE extID = ?", [udid]);
                    if (oldUserRows.length > 0) {
                        const oldUserID = oldUserRows[0].userID;
                        // Transfer levels to new account
                        await db.execute("UPDATE levels SET userID = ?, extID = ? WHERE userID = ?", [userID, id, oldUserID]);
                    }
                }
                catch (error) {
                    console_api_1.default.Warn("main", `UDID transfer failed for ${userName}: ${error}`);
                }
            }
            return `${id},${userID}`;
        }
        else if (pass === -1) {
            console_api_1.default.Log("main", `Failed login to account (Invalid password): ${userName}`);
            return "-12";
        }
        else {
            console_api_1.default.Log("main", `Failed login to account (Failed to check pass): ${userName}`);
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.login");
        console_api_1.default.FatalError("main", `Unhandled server exception with user login to account, automatic protection called at net.fimastgd.forevercore.api.accounts.login\nJSException: ${error}`);
        return "-1";
    }
};
exports.default = loginAccount;
