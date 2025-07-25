'package net.fimastgd.forevercore.api.levels.reportLevel';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const fixIp_1 = __importDefault(require("../lib/fixIp"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Reports a level in Geometry Dash
 * @param levelIDStr - Level ID to report
 * @param req - Express request
 * @returns Report ID if successful, "-1" if failed
 */
const reportLevel = async (levelIDStr, req) => {
    try {
        if (!levelIDStr) {
            console_api_1.default.Log("main", `Failed to report unknown level`);
            return "-1";
        }
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        const ip = await fixIp_1.default.getIP(req);
        // Check if user already reported this level
        const [rows] = await db_proxy_1.default.execute("SELECT COUNT(*) AS count FROM reports WHERE levelID = ? AND hostname = ?", [levelID, ip]);
        if (rows[0].count == 0) {
            // Submit new report
            const [result] = await db_proxy_1.default.execute("INSERT INTO reports (levelID, hostname) VALUES (?, ?)", [levelID, ip]);
            return result.insertId.toString();
        }
        else {
            console_api_1.default.Log("main", `Failed to report level: report from this IP already exists`);
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.reportLevel`);
        return "-1";
    }
};
exports.default = reportLevel;
