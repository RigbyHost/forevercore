`package net.fimastgd.forevercore.api.packs.getGauntlets`;

import { RowDataPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import GenerateHash from "../lib/generateHash";
import ConsoleApi from "../../modules/console-api";

/**
 * Interface for gauntlet data
 */
interface GauntletData extends RowDataPacket {
	ID: number;
	level1: number;
	level2: number;
	level3: number;
	level4: number;
	level5: number;
}

/**
 * Gets gauntlet levels for Geometry Dash
 * @param gdpsid - GDPS ID
 * @returns Formatted gauntlets string, "-1" if failed
 */
const getGauntlets = async (gdpsid: string): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		let gauntletstring = "";
		let str = "";

		// Get gauntlet data
		const [result] = await db.query<GauntletData[]>(
			"SELECT ID, level1, level2, level3, level4, level5 FROM gauntlets WHERE level5 != '0' ORDER BY ID ASC"
		);

		// Process each gauntlet
		for (const gauntlet of result) {
			const lvls = `${gauntlet.level1},${gauntlet.level2},${gauntlet.level3},${gauntlet.level4},${gauntlet.level5}`;
			gauntletstring += `1:${gauntlet.ID}:3:${lvls}|`;
			str += gauntlet.ID + lvls;
		}

		// Remove trailing pipe
		gauntletstring = gauntletstring.slice(0, -1);

		// Build response with hash
		let RESPONSE = "";
		RESPONSE += gauntletstring;
		RESPONSE += "#" + (await GenerateHash.genSolo2(str));

		ConsoleApi.Log("main", "Received gauntlets chunks");
		return RESPONSE;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getGauntlets`);
		return "-1";
	}
};

export default getGauntlets;
