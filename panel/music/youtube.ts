'package net.fimastgd.forevercore.panel.music.youtube';

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import settings from '../../serverconf/settings';

const db: Connection = require("../../serverconf/db");
const ConsoleApi = require("../../modules/console-api");

/*
ARRAY STRUCTURE:
    [0] = song name (string)
    [1] = url (string)
    [2] = size (string | number)
*/

async function getSongYoutubeInfo(array: [string, string, string | number, string]): Promise<string> {
    async function checkSong(): Promise<number> {
        // sorry
        return -1;
    }

    try {
        if (array[2] === "Unknown") {
            return "UnknownSongException:0";
        }

        const songId = await checkSong();
        if (songId === -1) {
            const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download, originalLink)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const [result] = await db.execute<ResultSetHeader>(query, [
                null,
                array[0],
                8,
                "Forever Music [YT]", 
                array[2],
                array[1],
                array[3]
            ]);

            const lastID = result.insertId.toString();
            ConsoleApi.Log("main", `Panel action: uploaded YouTube music. ID: ${lastID}`);
            return `Success:${lastID}`;
        } else {
            return `DublicateSongException:${songId}`;
        }
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.youtube`);
        return "UnknownSongException:0";
    }
}

export default getSongYoutubeInfo;

