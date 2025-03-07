'package net.fimastgd.forevercore.api.accounts.getUsers';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getUsers = async (pageStr, strStr) => {
    try {
        const page = await ExploitPatch.remove(pageStr);
        let userstring = "";
        const usrpagea = page * 10;
        const query = "SELECT userName, userID, coins, userCoins, icon, color1, color2, color3, iconType, special, extID, stars, creatorPoints, demons, diamonds, moons FROM users WHERE userID = ? OR userName LIKE CONCAT('%', ?, '%') ORDER BY stars DESC LIMIT 10 OFFSET ?";
        const [result] = await db.execute(query, [strStr, strStr, usrpagea]);
        if (result.length < 1) {
            return "-1";
        }
        const countQuery = "SELECT count(*) as count FROM users WHERE userName LIKE CONCAT('%', ?, '%')";
        const [countResult] = await db.execute(countQuery, [strStr]);
        const usercount = countResult[0].count;
        result.forEach(user => {
            user.extID = isNaN(user.extID) ? 0 : user.extID;
            userstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${user.extID}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:46:${user.diamonds}:52:${user.moons}|`;
        });
        userstring = userstring.slice(0, -1);
        ConsoleApi.Log("main", "Received user list");
        return `${userstring}#${usercount}:${usrpagea}:10`;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.accounts.getUsers`);
        return "-1";
    }
};

module.exports = getUsers;
