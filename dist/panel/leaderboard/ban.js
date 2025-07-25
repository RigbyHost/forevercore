'package net.fimastgd.forevercore.panel.leaderboard.ban';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../serverconf/db");
const ConsoleApi = require("../../modules/console-api");
const c = require("ansi-colors");
// 1 = banned (success)
// -1 = account not found
// -2 = unknown error
async function banUser(userName) {
    async function getAccountID(userName) {
        try {
            const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
            if (rows.length > 0) {
                return rows[0].accountID;
            }
            else {
                return null;
            }
        }
        catch (error) {
            ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.leaderboard.ban`);
            return null;
        }
    }
    try {
        const accountID = await getAccountID(userName);
        if (accountID === null) {
            return -1;
        }
        const [updateResult] = await db.execute("UPDATE users SET isBanned = 1 WHERE LOWER(userName) = LOWER(?)", [userName]);
        /* if (updateResult.affectedRows !== 0) {
            //
        } else {
            return -2;
        } */
        const timestamp = Math.floor(Date.now() / 1000);
        await db.execute("INSERT INTO modactions (type, value, value2, timestamp, account) VALUES ('15', ?, '1', ?, ?)", [accountID, timestamp, accountID]);
        ConsoleApi.Log("main", `Panel action: banned user: ${userName}`);
        return 1;
    }
    catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.leaderboard.ban`);
        return -2;
    }
}
exports.default = banUser;
