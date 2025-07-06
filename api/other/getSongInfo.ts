import { RowDataPacket } from 'mysql2/promise';
import ExploitPatch from '../lib/exploitPatch';
import db from '../../serverconf/db-proxy';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for song data
 */
interface SongData extends RowDataPacket {
  ID: number;
  name: string;
  authorID: number | string;
  authorName: string;
  size: number;
  isDisabled: number;
  download: string;
}

/**
 * Gets information about a song
 * @param songIDStr - Song ID
 * @returns Formatted song info string, "-1" if not found, "-2" if disabled
 */
const getSongInfo = async (songIDStr?: string): Promise<string> => {
  try {
    if (!songIDStr) {
      return "-1";
    }
    
    const songid = await ExploitPatch.remove(songIDStr);
    
    // Get song data
    const [rows] = await db.execute<SongData[]>(
      "SELECT ID, name, authorID, authorName, size, isDisabled, download FROM songs WHERE ID = ? LIMIT 1", 
      [songid]
    );
    
    if (rows.length === 0) {
      return "-1";
    }
    
    const result4 = rows[0];
    
    // Check if song is disabled
    if (result4.isDisabled == 1) {
      return "-2";
    }
    
    // Handle URL encoding for download link
    let dl = result4.download;
    if (dl.includes(":")) {
      dl = encodeURIComponent(dl);
    }
    
    // Format response
    const response = `1~|~${result4.ID}~|~2~|~${result4.name}~|~3~|~${result4.authorID}~|~4~|~${result4.authorName}~|~5~|~${result4.size}~|~6~|~~|~10~|~${dl}~|~7~|~~|~8~|~0`;
    
    return response;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.other.getSongInfo`);
    return "-1";
  }
};

export default getSongInfo;