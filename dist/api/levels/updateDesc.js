'package net.fimastgd.forevercore.api.levels.updateDesc';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Updates a level description in Geometry Dash
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param levelIDStr - Level ID to update
 * @param levelDescStr - New level description
 * @param udidStr - Device ID
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const updateDesc = async (accountIDStr, gjp2Str, gjpStr, levelIDStr, levelDescStr, udidStr, req) => {
    try {
        // Process parameters
        let levelDesc = await exploitPatch_1.default.remove(levelDescStr);
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        // Get account ID
        let id;
        if (udidStr) {
            id = await exploitPatch_1.default.remove(udidStr);
            if (!isNaN(Number(id))) {
                return "-1";
            }
        }
        else {
            id = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        }
        // Decode and fix description
        let rawDesc = Buffer.from(levelDesc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
        // Fix unclosed color tags
        if (rawDesc.includes("<c")) {
            const openTags = (rawDesc.match(/<c/g) || []).length;
            const closeTags = (rawDesc.match(/<\/c>/g) || []).length;
            if (openTags > closeTags) {
                rawDesc += "</c>".repeat(openTags - closeTags);
                levelDesc = Buffer.from(rawDesc).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
            }
        }
        // Update level description
        await db_proxy_1.default.execute("UPDATE levels SET levelDesc = ? WHERE levelID = ? AND extID = ?", [levelDesc, levelID, id]);
        console_api_1.default.Log("main", `Updated level desc: ${levelID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.updateDesc`);
        return "-1";
    }
};
exports.default = updateDesc;
