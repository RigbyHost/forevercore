'package net.fimastgd.forevercore.panel.music.zemu';

const db = require("../../serverconf/db");
const Panel = require("../main");
const axios = require('axios');
const apiURL = require("../../serverconf/api");

const ConsoleApi = require("../../modules/console-api");

async function getZeMuInfo(songid) {
    const url = apiURL.getZeMuInfo;
    const params = {
        songid: songid
    };

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    const response = await axios.post(url, params, config);
    // cretits: Zemu Library by Zemonkamin
    const API_RESPONSE = response.data;
    const reup = await Panel.songReupZM(API_RESPONSE);
    ConsoleApi.Log("main", `Panel action: uploaded ZeMu music from API`);
    return reup;
}

module.exports = getZeMuInfo;