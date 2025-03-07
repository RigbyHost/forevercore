'package net.fimastgd.forevercore.panel.packs.gauntlets';

import { Connection, RowDataPacket, FieldPacket } from 'mysql2/promise';
const db: Connection = require("../../serverconf/db");
const c = require("ansi-colors");
import ConsoleApi from "../../modules/console-api";
import Panel from '../../panel/main';

type int = number;
interface Gauntlet { 
    id: number;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
}

    async function getGauntlets() {
    const gauntletName: string[] = [
        "Fire",        // 1
        "Ice",         // 2
        "Poison",      // 3
        "Shadow",      // 4
        "Lava",        // 5
        "Bonus",       // 6
        "Demon",       // 7
        "Time",        // 8
        "Crystal",     // 9
        "Magic",       // 10
        "Spike",       // 11
        "Monster",     // 12
        "Doom",        // 13
        "Death",       // 14
        "Forest",      // 15
        "Rune",        // 16
        "Force",       // 17
        "Spooky",      // 18
        "Dragon",      // 19
        "Water",       // 20
        "Haunted",     // 21
        "Acid",        // 22
        "Witch",       // 23
        "Power",       // 24
        "Potion",      // 25
        "Snake",       // 26
        "Toxic",       // 27
        "Halloween",   // 28
        "Treasure",    // 29
        "Ghost",       // 30
        "Spider",      // 31
        "Gem",         // 32
        "Inferno",     // 33
        "Portal",      // 34
        "Strange",     // 35
        "Fantasy",     // 36
        "Christmas",   // 37
        "Surprise",    // 38
        "Mystery",     // 39
        "Cursed",      // 40
        "Cyborg",      // 41
        "Castle",      // 42
        "Grave",       // 43
        "Temple",      // 44
        "World",       // 45
        "Galaxy",      // 46
        "Universe",    // 47
        "Discord",     // 48
        "Split",       // 49
        "NCS I",       // 50
        "NCS II",      // 51
        "Unknown 1",   // 52 or else
        "Unknown 2",   // 53 or else
        "Unknown 3",   // 54 or else
        "Unknown 4",   // 55 or else
        "Unknown 5"    // 56 or else
    ];
    const [rows]: [RowDataPacket[], any] = await db.query("SELECT * FROM gauntlets");
	
	ConsoleApi.Log("main", `Panel action: received gauntlets`);
    return Promise.all(rows.map(async (row: RowDataPacket) => {
        const index = row.ID - 1; // используем id - 1 для поиска в массиве gauntletName
        return {
            id: gauntletName[index] || `Unknown (${row.ID})`,
            level1: `${await Panel.getLevelName(row.level1)} (${row.level1})`,
            level2: `${await Panel.getLevelName(row.level2)} (${row.level2})`,
            level3: `${await Panel.getLevelName(row.level3)} (${row.level3})`,
            level4: `${await Panel.getLevelName(row.level4)} (${row.level4})`,
            level5: `${await Panel.getLevelName(row.level5)} (${row.level5})`,
            originalid: row.ID
        };
    }));
}

export { getGauntlets };