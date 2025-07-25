"package net.fimastgd.forevercore.panel.music.dropbox";

import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "net.fimastgd.forevercore.modules.console-api";

/*
ARRAY STRUCTURE:
    [0] = song name (string)
    [1] = url (string)
    [2] = size (string | number)
*/

async function getSongDropboxInfo(gdpsid: string, array: [string, string, string | number]): Promise<string> {
	const db = await threadConnection(gdpsid);
	async function checkSong(): Promise<number> {
		const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM songs WHERE download = ?", [array[1]]);
		if (rows.length > 0) {
			return rows[0].ID;
		} else {
			return -1;
		}
	}

	try {
		if (array[2] === "Unknown") {
			return "UnknownSongException:0";
		}

		const songId = await checkSong();
		if (songId === -1) {
			const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download)
            VALUES (?, ?, ?, ?, ?, ?)`;

			const [result] = await db.execute<ResultSetHeader>(query, [null, array[0], 8, "Forever Music [Dropbox]", array[2], array[1]]);

			const lastID = result.insertId.toString();
			ConsoleApi.Log("main", `Panel action: uploaded DropBox music. ID: ${lastID}`);
			return `Success:${lastID}`;
		} else {
			return `DublicateSongException:${songId}`;
		}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.dropbox`);
		return "UnknownSongException:0";
	}
}

export default getSongDropboxInfo;
