"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets top creator list for Geometry Dash
 * @param accountIDStr - Account ID of requester
 * @param typeStr - List type
 * @returns Formatted creators string, "-1" if failed
 */
const getCreators = async (accountIDStr, typeStr) => {
    try {
        const accountID = await exploitPatch_1.default.remove(accountIDStr);
        const type = await exploitPatch_1.default.remove(typeStr);
        // Get top 100 creators
        const query = "SELECT * FROM users WHERE isCreatorBanned = '0' ORDER BY creatorPoints DESC LIMIT 100";
        const [result] = await db_proxy_1.default.query(query);
        let pplstring = "";
        let xi = 0;
        // Format each creator's data
        for (const user of result) {
            xi++;
            const extid = isNaN(Number(user.extID)) ? 0 : user.extID;
            pplstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}|`;
        }
        // Remove trailing pipe
        pplstring = pplstring.slice(0, -1);
        console_api_1.default.Log("main", "Received creators by accountID: " + accountID);
        return pplstring;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getCreators`);
        return "-1";
    }
};
exports.default = getCreators;
