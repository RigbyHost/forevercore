'package net.fimastgd.forevercore.api.levels.deleteLevelUser';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Deletes a level in Geometry Dash
 * @param levelIDStr - Level ID to delete
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteLevelUser = async (levelIDStr, accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        if (!Number.isInteger(Number(levelID))) {
            console_api_1.default.Log("main", `Failed to delete level ${levelID}: levelID is not a number`);
            return "-1";
        }
        const userID = await apiLib_1.default.getUserID(accountID);
        // Delete level from database
        const [result] = await db_proxy_1.default.execute("DELETE from levels WHERE levelID = ? AND userID = ? AND starStars = 0 LIMIT 1", [levelID, userID]);
        // Log action
        await db_proxy_1.default.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES (?, ?, ?, ?)", [8, levelID, Math.floor(Date.now() / 1000), userID]);
        // Move level file to deleted folder
        const levelPath = path_1.default.join(__dirname, "..", "..", "data", "levels", `${levelID}.dat`);
        const deletedLevelPath = path_1.default.join(__dirname, "..", "..", "data", "levels", "deleted", `${levelID}.dat`);
        if ((await promises_1.default
            .access(levelPath)
            .then(() => true)
            .catch(() => false)) &&
            result.affectedRows != 0) {
            await promises_1.default.rename(levelPath, deletedLevelPath);
        }
        console_api_1.default.Log("main", `Deleted level ${levelID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.deleteLevelUser`);
        return "-1";
    }
};
exports.default = deleteLevelUser;
