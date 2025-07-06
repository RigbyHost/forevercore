import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for friend request data
 */
interface FriendRequest extends RowDataPacket {
  accountID: number | string;
  toAccountID: number | string;
}

/**
 * Accepts a friend request in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const acceptFriendRequest = async (req: Request): Promise<string> => {
  try {
    // Check if request ID is provided
    if (!req.body.requestID) {
      ConsoleApi.Log("main", "Friend request not accept: requestID not found");
      return "-1";
    }
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const requestID = await ExploitPatch.remove(req.body.requestID);
    
    // Get friend request details
    const [requests] = await db.query<FriendRequest[]>(
      "SELECT accountID, toAccountID FROM friendreqs WHERE ID = ?", 
      [requestID]
    );
    
    if (requests.length === 0) {
      ConsoleApi.Log("main", "Friend request not accept: requests.length equal '0'");
      return "-1";
    }
    
    const request = requests[0];
    const reqAccountID = request.accountID;
    const toAccountID = request.toAccountID;
    
    // Verify request is for current user and not from self
    if (toAccountID != accountID || reqAccountID == accountID) {
      ConsoleApi.Log("main", "Friend request not accept: toAccountID not equal accountID or reqAccountID equal accountID");
      return "-1";
    }
    
    // Create friendship and delete request
    await db.query<ResultSetHeader>(
      "INSERT INTO friendships (person1, person2, isNew1, isNew2) VALUES (?, ?, 1, 1)", 
      [reqAccountID, toAccountID]
    );
    
    await db.query<ResultSetHeader>(
      "DELETE from friendreqs WHERE ID = ? LIMIT 1", 
      [requestID]
    );
    
    ConsoleApi.Log("main", `Accept friend request ${requestID} to accountID: ${accountID}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.acceptFriendRequest`);
    return "-1";
  }
};

export default acceptFriendRequest;