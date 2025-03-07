'package net.fimastgd.forevercore.api.other.likeItem';

const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const likeItem = async (typeStr, likeStr, itemIDStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        if (!req.body.itemID) {
            return "-1";
        }
        var type = typeStr ? typeStr : 1;
        var itemID = await ExploitPatch.remove(itemIDStr);
        var isLike = likeStr || 1;
        var ip = await ApiLib.getIP(req);
        const countQuery = await db.execute("SELECT COUNT(*) FROM actions_likes WHERE itemID = ? AND type = ? AND ip = INET6_ATON(?)", [itemID, type, ip]);
        if (countQuery[0][0]["COUNT(*)"] > 2) {
            return "-1";
        }
        await db.execute("INSERT INTO actions_likes (itemID, type, isLike, ip) VALUES (?, ?, ?, INET6_ATON(?))", [itemID, type, isLike, ip]);
        type = type.toString();
        var table, column;
        switch (type) {
            case "1":
                table = "levels";
                column = "levelID";
                break;
            case "2":
                table = "comments";
                column = "commentID";
                break;
            case "3":
                table = "acccomments";
                column = "commentID";
                break;
            case "4":
                table = "lists";
                column = "listID";
                break;
            default:
                throw new Error("Invalid type");
        }
        const likesQuery = await db.execute(`SELECT likes FROM ${table} WHERE ${column} = ? LIMIT 1`, [itemID]);
        const likes = likesQuery[0][0].likes;
        const sign = (isLike == 1) ? "+" : "-";
        await db.execute(`UPDATE ${table} SET likes = likes ${sign} 1 WHERE ${column} = ?`, [itemID]);
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.other.likeItem`);
        return "-1";
    }
};

module.exports = likeItem;
