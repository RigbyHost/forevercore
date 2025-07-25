"package net.fimastgd.forevercore.api.accounts.updateSettings";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../serverconf/db"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Updates account settings for a GD account
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2
 * @param gjpStr - GJP
 * @param mSStr - Message privacy
 * @param frSStr - Friend request privacy
 * @param cSStr - Comment privacy
 * @param ytStr - YouTube URL
 * @param xStr - Twitter/X handle
 * @param twitchStr - Twitch URL
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const updateSettings = async (gdpsid, accountIDStr, gjp2Str, gjpStr, mSStr, frSStr, cSStr, ytStr, xStr, twitchStr, req) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        if (!accountIDStr)
            throw new Error("accountID is not defined");
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Process parameters
        const mS = mSStr ? await exploitPatch_1.default.remove(mSStr) : 0;
        const frS = frSStr ? await exploitPatch_1.default.remove(frSStr) : 0;
        const cS = cSStr ? await exploitPatch_1.default.remove(cSStr) : 0;
        const youtubeurl = ytStr ? await exploitPatch_1.default.remove(ytStr) : "";
        const x = xStr ? await exploitPatch_1.default.remove(xStr) : ""; // Twitter/X handle
        const twitch = twitchStr ? await exploitPatch_1.default.remove(twitchStr) : "";
        // Update account settings
        const query = "UPDATE accounts SET mS = ?, frS = ?, cS = ?, youtubeurl = ?, twitter = ?, twitch = ? WHERE accountID = ?";
        await db.execute(query, [mS, frS, cS, youtubeurl, x, twitch, accountID]);
        console_api_1.default.Log("main", `User profile settings updated in accountID: ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.accounts.updateSettings`);
        return "-1";
    }
};
exports.default = updateSettings;
