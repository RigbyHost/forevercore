"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Likes an item (level, comment, etc) in Geometry Dash
 * @param typeStr - Item type (1=level, 2=comment, 3=account comment, 4=list)
 * @param likeStr - Like value (1=like, 0=dislike)
 * @param itemIDStr - Item ID
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const likeItem = async (typeStr, likeStr, itemIDStr, req) => {
    try {
        if (!req?.body?.itemID) {
            return "-1";
        }
        // Process parameters
        const type = typeStr ? parseInt(typeStr) : 1;
        const itemID = await exploitPatch_1.default.remove(itemIDStr);
        const isLike = likeStr ? parseInt(likeStr) : 1;
        const ip = await apiLib_1.default.getIP(req);
        // Check if user already liked this item
        const [countResult] = await db_proxy_1.default.execute("SELECT COUNT(*) as count FROM actions_likes WHERE itemID = ? AND type = ? AND ip = INET6_ATON(?)", [itemID, type, ip]);
        if (countResult[0].count > 2) {
            return "-1";
        }
        // Record like action
        await db_proxy_1.default.execute("INSERT INTO actions_likes (itemID, type, isLike, ip) VALUES (?, ?, ?, INET6_ATON(?))", [itemID, type, isLike, ip]);
        // Determine table and column based on item type
        let table, column;
        switch (type.toString()) {
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
        // Get current likes
        const [likesResult] = await db_proxy_1.default.execute(`SELECT likes FROM ${table} WHERE ${column} = ? LIMIT 1`, [itemID]);
        // Update likes count
        const sign = (isLike == 1) ? "+" : "-";
        await db_proxy_1.default.execute(`UPDATE ${table} SET likes = likes ${sign} 1 WHERE ${column} = ?`, [itemID]);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.other.likeItem`);
        return "-1";
    }
};
exports.default = likeItem;
