"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets information about a song
 * @param songIDStr - Song ID
 * @returns Formatted song info string, "-1" if not found, "-2" if disabled
 */
const getSongInfo = async (songIDStr) => {
    try {
        if (!songIDStr) {
            return "-1";
        }
        const songid = await exploitPatch_1.default.remove(songIDStr);
        // Get song data
        const [rows] = await db_proxy_1.default.execute("SELECT ID, name, authorID, authorName, size, isDisabled, download FROM songs WHERE ID = ? LIMIT 1", [songid]);
        if (rows.length === 0) {
            return "-1";
        }
        const result4 = rows[0];
        // Check if song is disabled
        if (result4.isDisabled == 1) {
            return "-2";
        }
        // Handle URL encoding for download link
        let dl = result4.download;
        if (dl.includes(":")) {
            dl = encodeURIComponent(dl);
        }
        // Format response
        const response = `1~|~${result4.ID}~|~2~|~${result4.name}~|~3~|~${result4.authorID}~|~4~|~${result4.authorName}~|~5~|~${result4.size}~|~6~|~~|~10~|~${dl}~|~7~|~~|~8~|~0`;
        return response;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.other.getSongInfo`);
        return "-1";
    }
};
exports.default = getSongInfo;
