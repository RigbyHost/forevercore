'package net.fimastgd.forevercore.api.levels.deleteLevelUser';

import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ApiLib from '../lib/apiLib';
import ConsoleApi from '../../modules/console-api';

/**
 * Deletes a level in Geometry Dash
 * @param levelIDStr - Level ID to delete
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteLevelUser = async (
  levelIDStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    const levelID = await ExploitPatch.remove(levelIDStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    
    if (!Number.isInteger(Number(levelID))) {
      ConsoleApi.Log("main", `Failed to delete level ${levelID}: levelID is not a number`);
      return "-1";
    }

    const userID = await ApiLib.getUserID(accountID);
    
    // Delete level from database
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE from levels WHERE levelID = ? AND userID = ? AND starStars = 0 LIMIT 1", 
      [levelID, userID]
    );
    
    // Log action
    await db.execute(
      "INSERT INTO actions (type, value, timestamp, value2) VALUES (?, ?, ?, ?)", 
      [8, levelID, Math.floor(Date.now() / 1000), userID]
    );
    
    // Move level file to deleted folder
    const levelPath = path.join(__dirname, "..", "..", "data", "levels", `${levelID}.dat`);
    const deletedLevelPath = path.join(__dirname, "..", "..", "data", "levels", "deleted", `${levelID}.dat`);
    
    if (
      (await fs
        .access(levelPath)
        .then(() => true)
        .catch(() => false)) &&
      result.affectedRows != 0
    ) {
      await fs.rename(levelPath, deletedLevelPath);
    }
    
    ConsoleApi.Log("main", `Deleted level ${levelID}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.deleteLevelUser`);
    return "-1";
  }
};

export default deleteLevelUser;