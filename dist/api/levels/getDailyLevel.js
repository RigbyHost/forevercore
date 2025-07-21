'package net.fimastgd.forevercore.api.levels.getDailyLevel';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets current daily or weekly level info
 * @param typeStr - Type (0 = daily, 1 = weekly, 2 = event)
 * @param weeklyStr - Alternative weekly flag
 * @returns Formatted daily level string, "-1" if failed
 */
const getDailyLevel = async (typeStr, weeklyStr) => {
    try {
        // Determine if this is a daily or weekly request
        const type = typeStr || weeklyStr || "0";
        // Calculate when the level will reset
        const midnight = type == "1"
            ? getNextMonday()
            : getTomorrow();
        const current = Math.floor(Date.now() / 1000);
        // Query database for current featured level
        const [rows] = await db_proxy_1.default.execute("SELECT feaID FROM dailyfeatures WHERE timestamp < ? AND type = ? ORDER BY timestamp DESC LIMIT 1", [current, type]);
        if (rows.length === 0) {
            return "-1";
        }
        // Calculate remaining time and feature ID
        let dailyID = rows[0].feaID;
        if (type == "1")
            dailyID += 100001;
        const timeleft = Math.floor(midnight.getTime() / 1000) - current;
        console_api_1.default.Log("main", `Received daily level. ID: ${dailyID}, timeleft: ${timeleft}`);
        return `${dailyID}|${timeleft}`;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.getDailyLevel`);
        return "-1";
    }
};
/**
 * Calculates the date of the next Monday
 * @returns Date object for next Monday at midnight
 */
function getNextMonday() {
    const date = new Date();
    date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));
    date.setHours(0, 0, 0, 0);
    return date;
}
/**
 * Calculates tomorrow's date
 * @returns Date object for tomorrow at midnight
 */
function getTomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
}
exports.default = getDailyLevel;
