import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Removes a friend in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const removeFriend = async (req: Request): Promise<string> => {
  try {
    // Check if target account ID is provided
    if (!req.body.targetAccountID) {
      ConsoleApi.Log("main", "Failed to remove friend: req.body.targetAccountID not found");
      return "-1";
    }
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);
    
    // Delete friendship in both directions
    const query1 = "DELETE FROM friendships WHERE person1 = ? AND person2 = ?";
    const query2 = "DELETE FROM friendships WHERE person2 = ? AND person1 = ?";
    
    await db.execute<ResultSetHeader>(query1, [accountID, targetAccountID]);
    await db.execute<ResultSetHeader>(query2, [accountID, targetAccountID]);
    
    ConsoleApi.Log("main", `Friend ${targetAccountID} removed by ${accountID}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.removeFriend`);
    return "-1";
  }
};

export default removeFriend;