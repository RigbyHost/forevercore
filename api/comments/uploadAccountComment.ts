'package net.fimastgd.forevercore.api.comments.uploadAccountComment';
import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Uploads a comment to a user's account page
 * @param userNameStr - Username
 * @param accountIDStr - Account ID
 * @param commentStr - Comment content
 * @param gjpStr - GJP hash
 * @param gjp2Str - GJP2 hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadAccountComment = async (
  userNameStr?: string,
  accountIDStr?: string,
  commentStr?: string,
  gjpStr?: string,
  gjp2Str?: string,
  req?: Request
): Promise<string> => {
  try {
    const userName = await ExploitPatch.remove(userNameStr);
    const comment = await ExploitPatch.remove(commentStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const userID = await ApiLib.getUserID(accountID, userName);

    if (accountID && comment) {
      // Decode comment for processing
      const decodeComment = Buffer.from(comment, "base64").toString("utf-8");
      const uploadDate = Math.floor(Date.now() / 1000);
      
      // Insert comment into database
      const query = `
        INSERT INTO acccomments (userName, comment, userID, timeStamp)
        VALUES (?, ?, ?, ?)
      `;
      
      await db.execute<ResultSetHeader>(query, [userName, comment, userID, uploadDate]);
      
      ConsoleApi.Log("main", `Uploaded account comment ${userName}: ${comment}`);
      return "1";
    } else {
      ConsoleApi.Warn("main", `Failed to upload account comment: ${userName}`);
      return "-1";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadAccountComment`);
    return "-1";
  }
};

export default uploadAccountComment;