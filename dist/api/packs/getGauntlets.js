"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const generateHash_1 = __importDefault(require("../lib/generateHash"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets gauntlet levels for Geometry Dash
 * @returns Formatted gauntlets string, "-1" if failed
 */
const getGauntlets = async () => {
    try {
        let gauntletstring = "";
        let string = "";
        // Get gauntlet data
        const [result] = await db_proxy_1.default.query("SELECT ID, level1, level2, level3, level4, level5 FROM gauntlets WHERE level5 != '0' ORDER BY ID ASC");
        // Process each gauntlet
        for (const gauntlet of result) {
            const lvls = `${gauntlet.level1},${gauntlet.level2},${gauntlet.level3},${gauntlet.level4},${gauntlet.level5}`;
            gauntletstring += `1:${gauntlet.ID}:3:${lvls}|`;
            string += gauntlet.ID + lvls;
        }
        // Remove trailing pipe
        gauntletstring = gauntletstring.slice(0, -1);
        // Build response with hash
        let RESPONSE = "";
        RESPONSE += gauntletstring;
        RESPONSE += "#" + (await generateHash_1.default.genSolo2(string));
        console_api_1.default.Log("main", "Received gauntlets chunks");
        return RESPONSE;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getGauntlets`);
        return "-1";
    }
};
exports.default = getGauntlets;
