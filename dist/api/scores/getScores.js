'package net.fimastgd.forevercore.api.scores.getScores';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const settings_1 = require("../../serverconf/settings");
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets leaderboard scores for Geometry Dash
 * @param gameVersionStr - Game version
 * @param accountIDStr - Account ID
 * @param udidStr - Device ID
 * @param typeStr - Leaderboard type
 * @param countStr - Number of entries to show
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns Formatted leaderboard string, "-1" if failed
 */
const getScores = async (gameVersionStr, accountIDStr, udidStr, typeStr, countStr, gjp2Str, gjpStr, req) => {
    try {
        // Initialize variables
        let stars = 0;
        let count = 0;
        let xi = 0;
        let lbstring = "";
        let halfCount;
        // Check if April Fools
        const dateINIT = new Date();
        const date = `${dateINIT.getDate()}-${dateINIT.getMonth() + 1}`;
        // Determine game version condition
        let sign;
        let udid;
        if (!gameVersionStr) {
            sign = "< 20 AND gameVersion <> 0";
        }
        else {
            sign = "> 19";
        }
        // Determine account ID or UDID
        let accountID;
        if (accountIDStr) {
            accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        }
        else {
            udid = await exploitPatch_1.default.remove(udidStr);
            if (!isNaN(Number(udid))) {
                return "-1";
            }
            accountID = udid;
        }
        // Process leaderboard type
        let type = await exploitPatch_1.default.remove(typeStr);
        if (type == "top" || type == "creators" || type == "relative") {
            let query;
            if (type == "top") {
                // Top leaderboard - sort by stars
                query = `SELECT * FROM users WHERE isBanned = '0' AND gameVersion ${sign} AND stars > 0 ORDER BY stars DESC LIMIT ${settings_1.settings.topCount}`;
                await db_proxy_1.default.query(query);
            }
            else if (type == "creators") {
                // Creator leaderboard - sort by creator points
                query = `SELECT * FROM users WHERE isCreatorBanned = '0' AND creatorPoints > 0 ORDER BY creatorPoints DESC LIMIT 100`;
                await db_proxy_1.default.query(query);
            }
            else if (type == "relative") {
                // Relative leaderboard - center around user's stars
                const [rows] = await db_proxy_1.default.query("SELECT * FROM users WHERE extID = ?", [accountID]);
                const user = rows[0];
                stars = user.stars;
                count = typeof countStr !== "undefined" ? parseInt(await exploitPatch_1.default.remove(countStr)) : 50;
                halfCount = Math.floor(count / 2);
                // MariaDB required query
                query = `
          SELECT *
          FROM (
            (
              SELECT *
              FROM users
              WHERE stars <= ?
                AND isBanned = 0
                AND gameVersion ${sign}
              ORDER BY stars DESC
              LIMIT ?
            )
            UNION
            (
              SELECT *
              FROM users
              WHERE stars >= ?
                AND isBanned = 0
                AND gameVersion ${sign}
              ORDER BY stars ASC
              LIMIT ?
            )
          ) AS A
          ORDER BY A.stars DESC
        `;
            }
            // Execute query
            const [result] = await db_proxy_1.default.query(query, [stars, halfCount, stars, halfCount]);
            // Special handling for relative leaderboard
            if (type === "relative") {
                const user = result[0];
                const extid = user.extID;
                await db_proxy_1.default.query("SET @rownum := 0;");
                const [leaderboard] = await db_proxy_1.default.query(`
          SELECT rank, stars FROM (
              SELECT @rownum := @rownum + 1 AS rank, stars, extID, isBanned
              FROM users WHERE isBanned = '0' AND gameVersion > 19 ORDER BY stars DESC
          ) as result WHERE extID = ?`, [extid]);
                const leaderboardData = leaderboard[0];
                xi = leaderboardData.rank - 1;
            }
            // Format user data for each user
            for (const user of result) {
                xi++;
                const extid = isNaN(Number(user.extID)) ? 0 : user.extID;
                if (date === "1-4") {
                    // April Fools day
                    lbstring += `1:ForeverTop:2:${user.userID}:13:999:17:999:6:${xi}:9:9:10:9:11:8:14:1:15:3:16:${extid}:3:999:8:99999:4:999:7:${extid}:46:99999|`;
                }
                else {
                    // Normal display
                    lbstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.round(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}:52:${user.moons}|`;
                }
            }
        }
        else if (type == "friends") {
            // Friends leaderboard
            const query4 = "SELECT * FROM friendships WHERE person1 = ? OR person2 = ?";
            const [result1] = await db_proxy_1.default.execute(query4, [accountID, accountID]);
            // Build friend list
            let people = "";
            for (const friendship of result1) {
                let person = friendship.person1;
                if (friendship.person1 == accountID) {
                    person = friendship.person2;
                }
                people += "," + person;
            }
            // Get all friend user data
            const query5 = `SELECT * FROM users WHERE extID IN (? ${people}) ORDER BY stars DESC`;
            const [result2] = await db_proxy_1.default.execute(query5, [accountID]);
            // Format friend data
            for (const user of result2) {
                let extid = isNaN(Number(user.extID)) ? 0 : user.extID;
                xi++;
                if (date === "1-4") {
                    // April Fools day
                    lbstring += `1:RobNotFriend:2:${user.userID}:13:999:17:999:6:${xi}:9:9:10:9:11:8:14:1:15:3:16:${extid}:3:999:8:99999:4:999:7:${extid}:46:99999|`;
                }
                else {
                    // Normal display
                    lbstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}|`;
                }
            }
        }
        // Check if any data found
        if (lbstring === "") {
            return "-1";
        }
        // Remove trailing pipe
        lbstring = lbstring.slice(0, -1);
        console_api_1.default.Log("main", `Received scores by accountID: ${accountID}`);
        return lbstring;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getScores`);
        return "-1";
    }
};
exports.default = getScores;
