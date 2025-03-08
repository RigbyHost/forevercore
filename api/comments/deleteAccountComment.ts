'package net.fimastgd.forevercore.api.comments.deleteAccountComment';
import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import ExploitPatch from '../lib/exploitPatch';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Deletes an account comment
 * @param commentIDStr - Comment ID to delete
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteAccountComment = async (
  commentIDStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Process parameters
    const commentID = await ExploitPatch.remove(commentIDStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const userID = await ApiLib.getUserID(accountID);
    
    // Check permission to delete comment
    const permission = await ApiLib.checkPermission(accountID, "actionDeleteComment");
    
    if (typeof(permission) === "number" && permission === 1) {
      // Admin can delete any comment
      const query = `DELETE FROM acccomments WHERE commentID = ? LIMIT 1`;
      await db.query<ResultSetHeader>(query, [commentID]);
    } else {
      // User can only delete their own comments
      const query = `DELETE FROM acccomments WHERE commentID = ? AND userID = ? LIMIT 1`;
      await db.query<ResultSetHeader>(query, [commentID, userID]);
    }
    
    ConsoleApi.Log("main", `Deleted account comment. AccountID: ${accountIDStr}, commentID: ${commentIDStr}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", "Failed to get account comments");
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.deleteAccountComment`);
    return "-1";
  }
};

export default deleteAccountComment;