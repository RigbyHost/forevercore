"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets top music artists
 * @param pageStr - Page number
 * @returns Formatted top artists string, "-1" if failed
 */
const topArtists = async (pageStr) => {
    try {
        let offset;
        // Process page parameter
        if (pageStr && pageStr != "") {
            offset = parseInt(await exploitPatch_1.default.number(pageStr));
            offset = offset * 2; // Multiply by 2 for pagination
        }
        else {
            offset = 0;
        }
        // Query for top artists
        const querywhat = `
      SELECT authorName, download 
      FROM songs 
      WHERE (authorName NOT LIKE '%Reupload%' AND authorName NOT LIKE 'unknown') 
      GROUP BY authorName 
      ORDER BY COUNT(authorName) DESC 
      LIMIT 20 OFFSET ${offset}
    `;
        const [res] = await db_proxy_1.default.query(querywhat);
        // Count total distinct artists
        const [countResult] = await db_proxy_1.default.query("SELECT count(DISTINCT(authorName)) as count FROM songs WHERE (authorName NOT LIKE '%Reupload%' AND authorName NOT LIKE 'unknown')");
        const totalCount = countResult[0].count;
        // Format result string
        let str = "";
        const date = new Date();
        const isAprilFools = `${date.getDate()}-${date.getMonth() + 1}` === "01-04";
        for (const sel of res) {
            str += `4:${sel.authorName}`;
            // Add SoundCloud URL if applicable
            if (sel.download.startsWith("https://api.soundcloud.com")) {
                if (encodeURIComponent(sel.authorName).includes("+")) {
                    str += `:7:../redirect?q=https%3A%2F%2Fsoundcloud.com%2Fsearch%2Fpeople?q=${sel.authorName}`;
                }
                else {
                    str += `:7:../redirect?q=https%3A%2F%2Fsoundcloud.com%2F${sel.authorName}`;
                }
            }
            str += "|";
        }
        // Remove trailing pipe and add metadata
        str = str.slice(0, -1);
        str += `#${totalCount}:${offset}:20`;
        return str;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.other.topArtists`);
        return "-1";
    }
};
exports.default = topArtists;
