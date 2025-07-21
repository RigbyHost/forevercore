'package net.fimastgd.forevercore.panel.lists.listLib';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../serverconf/db");
const ConsoleApi = require("../../modules/console-api");
const c = require('ansi-colors');
const ApiLib = require("../../api/lib/apiLib");
class ListLib {
    static async getReportList() {
        try {
            const [rows] = await db.query(`SELECT * FROM reports ORDER BY id DESC`);
            ConsoleApi.Log("main", `Panel action: received report list`);
            return rows;
        }
        catch (error) {
            ConsoleApi.Error("main", `getReportListException -> public: ${error} at net.fimastgd.forevercore.panel.lists.listLib`);
            return [];
        }
    }
    static async getSuggestList(offset) {
        try {
            if (offset > 0) {
                offset = offset * 2;
                offset = parseInt(`${offset}0`, 10);
            }
            const [rows] = await db.execute(`SELECT suggestBy, suggestLevelId, suggestDifficulty, suggestStars, suggestFeatured, suggestAuto, suggestDemon, timestamp FROM suggest ORDER BY timestamp DESC LIMIT 20 OFFSET ${offset}`);
            const result = await Promise.all(rows.map(async (row) => {
                const accountName = await ApiLib.getAccountName(row.suggestBy);
                return {
                    ...row,
                    suggestBy: accountName,
                    formattedDate: this.formatDate(row.timestamp),
                    difficulty: await ApiLib.getDifficulty(row.suggestDifficulty, row.suggestAuto, row.suggestDemon)
                };
            }));
            ConsoleApi.Log("main", "Panel action: received suggest list");
            return result;
        }
        catch (error) {
            ConsoleApi.Error("main", `getSuggestListException -> public: ${error} at net.fimastgd.forevercore.panel.lists.listLib`);
            return [];
        }
    }
    static async getUnlistedList(offset) {
        try {
            if (offset > 250) {
                return [];
            }
            if (offset > 0) {
                offset = parseInt(`${offset}0`, 10);
            }
            else if (offset < 0) {
                offset = 0;
            }
            else {
                offset = 0;
            }
            const [rows] = await db.query(`SELECT * FROM (SELECT * FROM levels WHERE unlisted != 0 LIMIT 50 OFFSET ${offset * 5}) AS subquery ORDER BY levelID DESC`);
            ConsoleApi.Log("main", "Received unlisted list");
            return rows;
        }
        catch (error) {
            ConsoleApi.Error("main", `getUnlistedListException -> public: ${error} at net.fimastgd.forevercore.panel.lists.listLib`);
            return [];
        }
    }
    static formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}
exports.default = ListLib;
