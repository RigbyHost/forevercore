import { Request } from 'express';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Requests moderator access for a GD user
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "2" for Elder Moderator, "1" for Moderator, "-1" if failed
 */
const requestUserAccess = async (
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    let permState: number | boolean;
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    
    // Check mod permissions
    if ((await ApiLib.getMaxValuePermission(accountID, "actionRequestMod")) >= 1) {
      permState = await ApiLib.getMaxValuePermission(accountID, "modBadgeLevel");
      
      // Return access level based on badge level
      if (permState >= 2) {
        ConsoleApi.Log("main", `Elder Moderator or else granted to accountID: ${accountID}`);
        return "2";
      }
      
      ConsoleApi.Log("main", `Moderator or else granted to accountID: ${accountID}`);
      return "1";
    }
    
    return "-1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.mods.requestUserAccess`);
    return "-1";
  }
};

export default requestUserAccess;