'package net.fimastgd.forevercore.api.comments.uploadComment';
import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Deletes a level comment
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param commentIDStr - Comment ID to delete
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteComment = async (
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  commentIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    const commentID = await ExploitPatch.remove(commentIDStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const userID = await ApiLib.getUserID(accountID);
    
    // Try to delete own comment first
    let [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM comments WHERE commentID = ? AND userID = ? LIMIT 1", 
      [commentID, userID]
    );
    
    // If no rows affected, check if user has permission to delete comment or is level owner
    if (result.affectedRows === 0) {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT users.extID 
         FROM comments 
         INNER JOIN levels ON levels.levelID = comments.levelID 
         INNER JOIN users ON levels.userID = users.userID 
         WHERE commentID = ?`, 
        [commentID]
      );
      
      const creatorAccID = rows[0]?.extID;
      
      // Delete if user is level creator or has admin permission
      if (creatorAccID == accountID || (await ApiLib.checkPermission(accountID, "actionDeleteComment")) === true) {
        await db.execute<ResultSetHeader>(
          "DELETE FROM comments WHERE commentID = ? LIMIT 1", 
          [commentID]
        );
      }
    }
    
    ConsoleApi.Log("main", `Deleted comment. AccountID: ${accountID}, commentID: ${commentID}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", "Failed to delete comment");
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteComment`);
    return "-1";
  }
};

export default deleteComment;