'package net.fimastgd.forevercore.panel.music.zemu';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const main_1 = __importDefault(require("../main"));
const api_1 = require("../../serverconf/api");
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets song info from ZeMu and uploads to database
 * @param songid - ZeMu song ID
 * @returns Success status and song ID
 */
const getZeMuInfo = async (songid) => {
    try {
        // Prepare API request
        const url = api_1.apiURL.getZeMuInfo;
        const params = {
            songid: songid
        };
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        // Make request to external API
        const response = await axios_1.default.post(url, params, config);
        // Credits: ZeMu Library by Zemonkamin
        const API_RESPONSE = response.data;
        // Process and reupload song
        const reup = await main_1.default.songReupZM(API_RESPONSE);
        console_api_1.default.Log("main", `Panel action: uploaded ZeMu music from API`);
        return reup;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.music.zemu`);
        return "UnknownSongException:0";
    }
};
exports.default = getZeMuInfo;
