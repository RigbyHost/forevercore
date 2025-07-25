"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const generateHash_1 = __importDefault(require("../lib/generateHash"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets map packs for Geometry Dash
 * @param req - Express request with page parameter
 * @returns Formatted map packs string, "-1" if failed
 */
const getMapPacks = async (req) => {
    try {
        // Get page parameter
        const page = await exploitPatch_1.default.remove(req.body.page);
        const packpage = parseInt(page) * 10;
        let mappackstring = "";
        let lvlsmultistring = "";
        // Get map packs data
        const [result] = await db_proxy_1.default.query("SELECT colors2, rgbcolors, ID, name, levels, stars, coins, difficulty FROM `mappacks` ORDER BY `ID` ASC LIMIT 10 OFFSET ?", [packpage]);
        const packcount = result.length;
        // Process each map pack
        for (const mappack of result) {
            lvlsmultistring += `${mappack.ID},`;
            // Handle colors
            let colors2 = mappack.colors2;
            if (colors2 == "none" || colors2 == "") {
                colors2 = mappack.rgbcolors;
            }
            // Build map pack string
            mappackstring += `1:${mappack.ID}:2:${mappack.name}:3:${mappack.levels}:4:${mappack.stars}:5:${mappack.coins}:6:${mappack.difficulty}:7:${mappack.rgbcolors}:8:${colors2}|`;
        }
        // Get total pack count
        const [totalPackCountResult] = await db_proxy_1.default.query("SELECT count(*) as count FROM mappacks");
        const totalpackcount = totalPackCountResult[0].count;
        // Remove trailing separators
        mappackstring = mappackstring.slice(0, -1);
        lvlsmultistring = lvlsmultistring.slice(0, -1);
        // Generate hash and build response
        const response = `${mappackstring}#${totalpackcount}:${packpage}:10#${await generateHash_1.default.genPack(lvlsmultistring)}`;
        console_api_1.default.Log("main", `Received MapPack chunk mpch.0.${page}`);
        return response;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getMapPacks`);
        return "-1";
    }
};
exports.default = getMapPacks;
