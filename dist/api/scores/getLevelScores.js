'package net.fimastgd.forevercore.api.scores.getLevelScores';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const XORCipher_1 = __importDefault(require("../lib/XORCipher"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets level scores for a specific level
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param levelIDStr - Level ID to get scores for
 * @param percentStr - Percent to submit (if submitting)
 * @param s1Str - Attempts data
 * @param s2Str - Clicks data
 * @param s3Str - Time spent data
 * @param s6Str - Progress data
 * @param s9Str - Coins data
 * @param s10Str - Daily ID data
 * @param typeStr - Score type (0 = friends, 1 = all, 2 = weekly)
 * @param req - Express request
 * @returns Formatted level scores string, "-1" if failed
 */
const getLevelScores = async (accountIDStr, gjp2Str, gjpStr, levelIDStr, percentStr, s1Str, s2Str, s3Str, s6Str, s9Str, s10Str, typeStr, req) => {
    try {
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        const percent = await exploitPatch_1.default.remove(percentStr);
        const uploadDate = Math.floor(Date.now() / 1000);
        // Process stats parameters
        const attempts = s1Str && s1Str !== "" ? Number(s1Str) - 8354 : 0;
        const clicks = s2Str && s2Str !== "" ? Number(s2Str) - 3991 : 0;
        const time = s3Str && s3Str !== "" ? Number(s3Str) - 4085 : 0;
        const progresses = s6Str && s6Str !== ""
            ? await XORCipher_1.default.cipher(Buffer.from(s6Str.replace(/_/g, "/").replace(/-/g, "+"), "base64").toString(), 41274)
            : "0";
        const coins = s9Str && s9Str !== "" ? Number(s9Str) - 5819 : 0;
        const dailyID = s10Str && s10Str !== "" ? s10Str : "0";
        // Get user ID
        const userID = await apiLib_1.default.getUserID(accountID);
        // Determine condition based on daily/weekly level
        const condition = Number(dailyID) > 0 ? ">" : "=";
        // Check if user already has a score for this level
        const [oldPercentRows] = await db_proxy_1.default.query(`SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ? AND dailyID ${condition} 0`, [accountID, levelID]);
        const oldPercent = oldPercentRows.length > 0 ? oldPercentRows[0].percent : null;
        // Either create new score entry or update if better
        if (oldPercentRows.length == 0) {
            // Insert new record
            await db_proxy_1.default.query("INSERT INTO levelscores (accountID, levelID, percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [accountID, levelID, percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID]);
        }
        else {
            // Update if new percent is higher or equal
            if (oldPercent <= percent) {
                await db_proxy_1.default.query(`UPDATE levelscores SET percent=?, uploadDate=?, coins=?, attempts=?, clicks=?, time=?, progresses=?, dailyID=? WHERE accountID=? AND levelID=? AND dailyID ${condition} 0`, [percent, uploadDate, coins, attempts, clicks, time, progresses, dailyID, accountID, levelID]);
            }
            else {
                // Check for duplicate (shouldn't happen normally)
                const [count] = await db_proxy_1.default.query("SELECT count(*) as count FROM levelscores WHERE percent=? AND uploadDate=? AND accountID=? AND levelID=? AND coins = ? AND attempts = ? AND clicks = ? AND time = ? AND progresses = ? AND dailyID = ?", [percent, uploadDate, accountID, levelID, coins, attempts, clicks, time, progresses, dailyID]);
                // Additional handling could be added here if needed
            }
        }
        // Ban check for impossible percentages
        if (Number(percent) > 100) {
            await db_proxy_1.default.query("UPDATE users SET isBanned=1 WHERE extID = ?", [accountID]);
        }
        // Determine query type (friends, all, or weekly scores)
        const type = typeStr ? parseInt(typeStr) : 1;
        let query, queryArgs;
        switch (type) {
            case 0: // Friends
                const friends = await apiLib_1.default.getFriends(accountID);
                friends.push(parseInt(accountID));
                const friendsString = friends.join(",");
                query = `SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID ${condition} 0 AND levelID = ? AND accountID IN (${friendsString}) ORDER BY percent DESC`;
                queryArgs = [levelID];
                break;
            case 1: // All players
                query = `SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID ${condition} 0 AND levelID = ? ORDER BY percent DESC`;
                queryArgs = [levelID];
                break;
            case 2: // Weekly (recent scores)
                query = `SELECT accountID, uploadDate, percent, coins FROM levelscores WHERE dailyID ${condition} 0 AND levelID = ? AND uploadDate > ? ORDER BY percent DESC`;
                queryArgs = [levelID, Math.floor(Date.now() / 1000) - 604800]; // Last 7 days
                break;
            default:
                return "-1";
        }
        // Get scores
        const [scores] = await db_proxy_1.default.query(query, queryArgs);
        // Format response
        let response = "";
        for (const score of scores) {
            // Get user data
            const [userRows] = await db_proxy_1.default.query("SELECT userName, userID, icon, color1, color2, color3, iconType, special, extID, isBanned FROM users WHERE extID = ?", [score.accountID]);
            const user = userRows[0];
            // Format date
            const time = new Date(score.uploadDate * 1000)
                .toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
                .replace(",", "")
                .replace(/:/, ".");
            // Skip banned users
            if (user.isBanned == 0) {
                // Determine place icon (1 = completed, 2 = almost completed, 3 = not completed)
                let place;
                if (score.percent == 100) {
                    place = 1;
                }
                else if (score.percent > 75) {
                    place = 2;
                }
                else {
                    place = 3;
                }
                // Build score string
                response += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${user.extID}:3:${score.percent}:6:${place}:13:${score.coins}:42:${time}|`;
            }
        }
        console_api_1.default.Log("main", `Received level scores by accountID: ${accountID}`);
        return response;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getLevelScores`);
        return "-1";
    }
};
exports.default = getLevelScores;
