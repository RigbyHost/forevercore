'package net.fimastgd.forevercore.api.levels.rateDemon';

import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Sets the demon difficulty rating for a level
 * @param accountIDStr - Account ID of moderator
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param ratingStr - Demon difficulty rating (1-5)
 * @param levelIDStr - Level ID to rate
 * @param req - Express request
 * @returns Level ID if successful, "-1" if failed
 */
const rateDemon = async (
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  ratingStr?: string,
  levelIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Validate required parameters
    const gjp2check = gjp2Str || gjpStr;
    if (!gjp2check || !ratingStr || !levelIDStr || !accountIDStr) {
      return "-1";
    }

    // Process parameters
    const rating = await ExploitPatch.remove(ratingStr);
    const levelID = await ExploitPatch.remove(levelIDStr);

    // Authenticate moderator
    const id = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    
    // Check if user has permission to rate demons
    if (!(await ApiLib.checkPermission(id, "actionRateDemon"))) {
      return "-1";
    }
    
    // Map rating to demon difficulty
    let dmn: number, dmnname: string;
    switch (parseInt(rating)) {
      case 1:
        dmn = 3;
        dmnname = "Easy";
        break;
      case 2:
        dmn = 4;
        dmnname = "Medium";
        break;
      case 3:
        dmn = 0;
        dmnname = "Hard";
        break;
      case 4:
        dmn = 5;
        dmnname = "Insane";
        break;
      case 5:
        dmn = 6;
        dmnname = "Extreme";
        break;
      default:
        return "-1";
    }

    // Update level difficulty and log action
    const timestamp = Math.floor(Date.now() / 1000);
    
    await db.execute<ResultSetHeader>(
      "UPDATE levels SET starDemonDiff = ? WHERE levelID = ?", 
      [dmn, levelID]
    );
    
    await db.execute<ResultSetHeader>(
      "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", 
      [10, dmnname, levelID, timestamp, id]
    );
    
    ConsoleApi.Log("main", `Rated level ${levelID} to demon: ${dmnname}`);
    return levelID.toString();
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateDemon`);
    return "-1";
  }
};

export default rateDemon;