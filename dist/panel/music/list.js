'package net.fimastgd.forevercore.panel.music.list';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../serverconf/db");
const c = require('ansi-colors');
const ConsoleApi = require("../../modules/console-api");
async function getSongList(OFFSET) {
    try {
        if (parseInt(OFFSET) > 250) {
            return [];
        }
        if (parseInt(OFFSET) > 0) {
            OFFSET = `${OFFSET}0`;
            OFFSET = parseInt(OFFSET);
        }
        else if (OFFSET < 0) {
            OFFSET = "0";
        }
        else {
            OFFSET = "0";
        }
        const [rows] = await db.query(`SELECT * FROM (SELECT * FROM songs LIMIT 20 OFFSET ${OFFSET * 2}) AS subquery ORDER BY id ASC`);
        ConsoleApi.Log("main", `Panel action: received song list. offset: ${OFFSET}`);
        return rows;
    }
    catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.list`);
        return [];
    }
}
exports.default = getSongList;
