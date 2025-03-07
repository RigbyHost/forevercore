import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for creator data
 */
interface Creator extends RowDataPacket {
  userName: string;
  userID: number;
  coins: number;
  userCoins: number;
  icon: number;
  color1: number;
  color2: number;
  iconType: number;
  special: number;
  extID: number | string;
  stars: number;
  creatorPoints: number;
  demons: number;
  diamonds: number;
}

/**
 * Gets top creator list for Geometry Dash
 * @param accountIDStr - Account ID of requester
 * @param typeStr - List type
 * @returns Formatted creators string, "-1" if failed
 */
const getCreators = async (
  accountIDStr?: string,
  typeStr?: string
): Promise<string> => {
  try {
    const accountID = await ExploitPatch.remove(accountIDStr);
    const type = await ExploitPatch.remove(typeStr);
    
    // Get top 100 creators
    const query = "SELECT * FROM users WHERE isCreatorBanned = '0' ORDER BY creatorPoints DESC LIMIT 100";
    const [result] = await db.query<Creator[]>(query);
    
    let pplstring = "";
    let xi = 0;
    
    // Format each creator's data
    for (const user of result) {
      xi++;
      const extid = isNaN(Number(user.extID)) ? 0 : user.extID;
      pplstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}|`;
    }
    
    // Remove trailing pipe
    pplstring = pplstring.slice(0, -1);
    
    ConsoleApi.Log("main", "Received creators by accountID: " + accountID);
    return pplstring;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getCreators`);
    return "-1";
  }
};

export default getCreators;