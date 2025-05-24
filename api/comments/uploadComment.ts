'package net.fimastgd.forevercore.api.comments.uploadComment';

import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import CommandLib from '../lib/commandLib';
import ConsoleApi from '../../modules/console-api';

/**
 * Uploads a comment to a level in Geometry Dash
 * @param userNameStr - Username
 * @param gameVersionStr - Game version
 * @param commentStr - Comment content
 * @param levelIDStr - Level ID to comment on
 * @param percentStr - Completion percentage
 * @param udidStr - Device ID
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadComment = async (
  userNameStr?: string,
  gameVersionStr?: string,
  commentStr?: string,
  levelIDStr?: string,
  percentStr?: string,
  udidStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    const userName = userNameStr ? await ExploitPatch.remove(userNameStr) : "";
    const gameVersion = gameVersionStr ? parseInt(await ExploitPatch.number(gameVersionStr)) : 0;
    let comment = await ExploitPatch.remove(commentStr);
    comment = gameVersion < 20 ? Buffer.from(comment).toString("base64") : comment;
    const levelID = (parseInt(levelIDStr) < 0 ? "-" : "") + (await ExploitPatch.number(levelIDStr));
    const percent = percentStr ? await ExploitPatch.remove(percentStr) : 0;
    
    let id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
    const idNum = parseInt(id);
    const register = !isNaN(idNum);
    
    const userID = await ApiLib.getUserID(id, userName);
    const uploadDate = Math.floor(Date.now() / 1000);
    const decodecomment = Buffer.from(comment, "base64").toString("utf-8");
    
    // Проверяем, является ли комментарий командой
    const commandResult = await CommandLib.doCommands(id, decodecomment, levelID);
    if (commandResult === true) {
      const result = gameVersion > 20 ? "temp_0_<cg>Command completed successfully!</c>" : "-1";
      return result;
    } else if (commandResult === "NO") {
      const resultNO = gameVersion > 20 ? "temp_0_<cr>No permissions</c>" : "-1";
      return resultNO;
    }
    
    if (id != "" && comment != "") {
      // Добавляем комментарий в базу данных, включая поле progresses
      await db.execute<ResultSetHeader>(
        "INSERT INTO comments (userName, comment, levelID, userID, timeStamp, percent, isSpam) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userName, comment, levelID, userID, uploadDate, percent, 0] // Добавляем пустое значение для progresses
      );
      
      // Если комментарий содержит процент прохождения, обновляем статистику
      if (register && parseInt(percent.toString()) != 0) {
        const [rows] = await db.execute<any[]>(
          "SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ?", 
          [id, levelID]
        );
        
        if (rows.length == 0) {
          await db.execute(
            "INSERT INTO levelscores (accountID, levelID, percent, uploadDate) VALUES (?, ?, ?, ?)",
            [id, levelID, percent, uploadDate]
          );
        } else if (rows[0].percent < percent) {
          await db.execute(
            "UPDATE levelscores SET percent = ?, uploadDate = ? WHERE accountID = ? AND levelID = ?",
            [percent, uploadDate, id, levelID]
          );
        }
      }
      
      ConsoleApi.Log("main", `Uploaded comment to level ${levelID} by ${userName}: ${comment}`);
      return "1";
    } else {
      ConsoleApi.Warn("main", `Failed upload comment to level ${levelID} by ${userName}: ${comment}`);
      return "-1";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadComment`);
    return "-1";
  }
};

export default uploadComment;