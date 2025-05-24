import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Uploads a friend request in Geometry Dash
 * @param accountIDStr - Account ID of sender
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param toAccountIDStr - Account ID of receiver
 * @param commentStr - Friend request message
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const uploadFriendRequest = async (
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  toAccountIDStr?: string,
  commentStr?: string,
  req?: Request
): Promise<string> => {
  try {
    if (!toAccountIDStr) {
      ConsoleApi.Log("main", `Failed to upload friend request: toAccountIDStr not found`);
      return "-1";
    }
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const toAccountID = await ExploitPatch.number(toAccountIDStr);

    // Prevent self-friending
    if (toAccountID == accountID) {
      ConsoleApi.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: toAccountID equal accountID`);
      return "-1";
    }
    
    const comment = await ExploitPatch.remove(commentStr);
    const uploadDate = Math.floor(Date.now() / 1000);

    // Check if user is blocked
    const [blocked] = await db.query<RowDataPacket[]>(
      "SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?", 
      [toAccountID, accountID]
    );
    
    // Check if receiver has friends-only setting
    const [frSOnly] = await db.query<RowDataPacket[]>(
      "SELECT frS FROM `accounts` WHERE accountID = ? AND frS = 1", 
      [toAccountID]
    );
    
    // Check if request already exists
    const [existingRequests] = await db.query<RowDataPacket[]>(
      "SELECT count(*) as count FROM friendreqs WHERE (accountID = ? AND toAccountID = ?) OR (toAccountID = ? AND accountID = ?)", 
      [accountID, toAccountID, accountID, toAccountID]
    );
    
    // Only create request if no existing requests, not blocked, and allowed by settings
    if (existingRequests[0].count == 0 && !blocked.length && !frSOnly.length) {
      await db.query<ResultSetHeader>(
        "INSERT INTO friendreqs (accountID, toAccountID, comment, uploadDate) VALUES (?, ?, ?, ?)", 
        [accountID, toAccountID, comment, uploadDate]
      );
      
      ConsoleApi.Log("main", `Uploaded friend request to ${toAccountID} from ${accountID}`);
      return "1";
    } else {
      ConsoleApi.Log("main", `Failed to upload friend request to ${toAccountID} from ${accountID}: existingRequests[0].count equal '0' and blocked.length not found and frSOnly.length not found`);
      return "-1";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.uploadFriendRequest`);
    return "-1";
  }
};

export default uploadFriendRequest;