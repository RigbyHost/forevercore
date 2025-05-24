'package net.fimastgd.forevercore.panel.packs.mappacks';

import { Connection, RowDataPacket, FieldPacket } from 'mysql2/promise';
const db: Connection = require("../../serverconf/db");
const c = require("ansi-colors");
import ConsoleApi from "../../modules/console-api";

type int = number;

interface MapData {
    ID: number;
    name: string;
    levels: string;
    stars: number;
    coins: number;
    difficulty: number;
    rgbcolors: string;
}

interface FormattedMapPacks {
    ID: number;
    name: string;
    levels: string;
    difficulty: string;
    coins: number;
}
 
const difficultyNames: string[] = ["Auto", "Easy", "Normal", "Hard", "Harder", "Insane", "Demon"];

async function getLevelName(level: number): Promise<string> {
    try {
    const Panel = require("../main");
    const levelName = await Panel.getLevelName(level);
    return `${levelName} (${level})`;
    } catch (e) {
		ConsoleApi.Error("main", `${e} at net.fimastgd.forevercore.panel.packs.mappacks`);
        return "Unknown (0)";
    }
}

async function getMapPacks(): Promise<FormattedMapPacks[]> {
    const query = "SELECT ID, name, levels, stars, coins, difficulty, rgbcolors FROM mappacks";
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db.query(query);

    const formattedData = await Promise.all(rows.map(async (row) => {
        const mapData: MapData = {
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
		
		ConsoleApi.Log("main", `Panel action: received mappacks`);
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

export default getMapPacks;