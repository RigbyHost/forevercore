'package net.fimastgd.forevercore.panel.music.newgrounds';

const db = require("../../serverconf/db");
const Panel = require("../main");
const axios = require('axios');
const apiURL = require("../../serverconf/api");

const ConsoleApi = require("../../modules/console-api");

async function getSongInfo(songid) {
    const url = apiURL.getSongInfo;
    const params = {
        songid: songid
    };

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    const response = await axios.post(url, params, config);
    // cretits: GMDPrivateServer by Cvolton
    const API_RESPONSE = response.data;
    const reup = await Panel.songReupNG(API_RESPONSE);
    ConsoleApi.Log("main", `Panel action: uploaded newgrounds music from API`);
    return reup;
}

module.exports = getSongInfo;