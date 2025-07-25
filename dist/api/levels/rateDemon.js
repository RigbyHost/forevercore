'package net.fimastgd.forevercore.api.levels.rateDemon';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Sets the demon difficulty rating for a level
 * @param accountIDStr - Account ID of moderator
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param ratingStr - Demon difficulty rating (1-5)
 * @param levelIDStr - Level ID to rate
 * @param req - Express request
 * @returns Level ID if successful, "-1" if failed
 */
const rateDemon = async (accountIDStr, gjp2Str, gjpStr, ratingStr, levelIDStr, req) => {
    try {
        // Validate required parameters
        const gjp2check = gjp2Str || gjpStr;
        if (!gjp2check || !ratingStr || !levelIDStr || !accountIDStr) {
            return "-1";
        }
        // Process parameters
        const rating = await exploitPatch_1.default.remove(ratingStr);
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        // Authenticate moderator
        const id = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Check if user has permission to rate demons
        if (!(await apiLib_1.default.checkPermission(id, "actionRateDemon"))) {
            return "-1";
        }
        // Map rating to demon difficulty
        let dmn, dmnname;
        switch (parseInt(rating)) {
            case 1:
                dmn = 3;
                dmnname = "Easy";
                break;
            case 2:
                dmn = 4;
                dmnname = "Medium";
                break;
            case 3:
                dmn = 0;
                dmnname = "Hard";
                break;
            case 4:
                dmn = 5;
                dmnname = "Insane";
                break;
            case 5:
                dmn = 6;
                dmnname = "Extreme";
                break;
            default:
                return "-1";
        }
        // Update level difficulty and log action
        const timestamp = Math.floor(Date.now() / 1000);
        await db_proxy_1.default.execute("UPDATE levels SET starDemonDiff = ? WHERE levelID = ?", [dmn, levelID]);
        await db_proxy_1.default.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [10, dmnname, levelID, timestamp, id]);
        console_api_1.default.Log("main", `Rated level ${levelID} to demon: ${dmnname}`);
        return levelID.toString();
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateDemon`);
        return "-1";
    }
};
exports.default = rateDemon;
