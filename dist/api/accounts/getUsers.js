"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../serverconf/db"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Get users matching a search string
 * @param pageStr - Page number
 * @param strStr - Search string
 * @returns Formatted user list
 */
const getUsers = async (gdpsid, pageStr, strStr) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        const page = await exploitPatch_1.default.remove(pageStr);
        let userstring = "";
        const usrpagea = parseInt(page) * 10;
        // Query database for users
        const query = `
      SELECT 
        userName, userID, coins, userCoins, icon, color1, color2, color3, 
        iconType, special, extID, stars, creatorPoints, demons, diamonds, moons 
      FROM users 
      WHERE userID = ? OR userName LIKE CONCAT('%', ?, '%') 
      ORDER BY stars DESC LIMIT 10 OFFSET ?
    `;
        const [result] = await db.execute(query, [strStr, strStr, usrpagea]);
        if (result.length < 1) {
            return "-1";
        }
        // Count total users matching search
        const countQuery = "SELECT count(*) as count FROM users WHERE userName LIKE CONCAT('%', ?, '%')";
        const [countResult] = await db.execute(countQuery, [strStr]);
        const usercount = countResult[0].count;
        // Format user data
        result.forEach(user => {
            user.extID = isNaN(Number(user.extID)) ? 0 : user.extID;
            userstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${user.extID}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:46:${user.diamonds}:52:${user.moons}|`;
        });
        userstring = userstring.slice(0, -1);
        console_api_1.default.Log("main", "Received user list");
        return `${userstring}#${usercount}:${usrpagea}:10`;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.accounts.getUsers`);
        return "-1";
    }
};
exports.default = getUsers;
