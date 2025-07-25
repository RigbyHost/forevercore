'package net.fimastgd.forevercore.panel.packs.mappacks';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../serverconf/db");
const c = require("ansi-colors");
const console_api_1 = __importDefault(require("../../modules/console-api"));
const difficultyNames = ["Auto", "Easy", "Normal", "Hard", "Harder", "Insane", "Demon"];
async function getLevelName(level) {
    try {
        const Panel = require("../main");
        const levelName = await Panel.getLevelName(level);
        return `${levelName} (${level})`;
    }
    catch (e) {
        console_api_1.default.Error("main", `${e} at net.fimastgd.forevercore.panel.packs.mappacks`);
        return "Unknown (0)";
    }
}
async function getMapPacks() {
    const query = "SELECT ID, name, levels, stars, coins, difficulty, rgbcolors FROM mappacks";
    const [rows] = await db.query(query);
    const formattedData = await Promise.all(rows.map(async (row) => {
        const mapData = {
            ID: row.ID,
            name: row.name,
            levels: row.levels,
            stars: row.stars,
            coins: row.coins,
            difficulty: row.difficulty,
            rgbcolors: row.rgbcolors,
        };
        const levelsArray = mapData.levels.split(',').map(Number);
        const levels = await Promise.all(levelsArray.map(getLevelName));
        const levelsString = levels.join(', ');
        const difficultyName = difficultyNames[mapData.difficulty] || "Unknown";
        console_api_1.default.Log("main", `Panel action: received mappacks`);
        return {
            ID: mapData.ID,
            name: `<div style="color: rgb(${mapData.rgbcolors});"><b>${mapData.name}</b></div>`,
            originalName: mapData.name,
            levels: levelsString,
            difficulty: `${difficultyName} (${mapData.stars})`,
            coins: mapData.coins
        };
    }));
    return formattedData;
}
exports.default = getMapPacks;
