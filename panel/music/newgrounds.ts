'package net.fimastgd.forevercore.panel.music.newgrounds';

import axios from 'axios';
import Panel from '../main';
import { apiURL } from '../../serverconf/api';
import ConsoleApi from '../../modules/console-api';

/**
 * Gets song info from Newgrounds and uploads to database
 * @param songid - Newgrounds song ID
 * @returns Success status and song ID
 */
const getSongInfo = async (songid: string | number): Promise<string> => {
  try {
    // Prepare API request
    const url = apiURL.getSongInfo;
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
    // Credits: GMDPrivateServer by Cvolton
    const API_RESPONSE = response.data;
    
    // Process and reupload song
    const reup = await Panel.songReupNG(API_RESPONSE);
    
    ConsoleApi.Log("main", `Panel action: uploaded newgrounds music from API`);
    return reup;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.newgrounds`);
    return "UnknownSongException:0";
  }
};

export default getSongInfo;