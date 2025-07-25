"package net.fimastgd.forevercore.panel.music.zemu";

import axios from "axios";
import Panel from "../main";
import { apiURL } from "../../serverconf/api";
import ConsoleApi from "../../modules/console-api";

/**
 * Gets song info from ZeMu and uploads to database
 * @param songid - ZeMu song ID
 * @returns Success status and song ID
 */
const getZeMuInfo = async (gdpsid: string, songid: string | number): Promise<string> => {
	try {
		// Prepare API request
		const url = apiURL.getZeMuInfo;
		const params = {
			songid: songid
		};

		const config = {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		};

		// Make request to external API
		const response = await axios.post(url, params, config);
		// Credits: ZeMu Library by Zemonkamin
		const API_RESPONSE = response.data;

		// Process and reupload song
		const reup = await Panel.songReupZM(gdpsid, API_RESPONSE);

		ConsoleApi.Log("main", `Panel action: uploaded ZeMu music from API`);
		return reup;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.zemu`);
		return "UnknownSongException:0";
	}
};

export default getZeMuInfo;
