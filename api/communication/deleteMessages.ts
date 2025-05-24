import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Deletes messages from a GD user's inbox
 * @param messageIDStr - Single message ID to delete
 * @param messagesStr - Multiple message IDs to delete (comma-separated)
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const deleteMessages = async (
  messageIDStr?: string,
  messagesStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Process input parameters
    let messageID = messageIDStr ? await ExploitPatch.remove(messageIDStr) : null;
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);

    if (messagesStr) {
      // Delete multiple messages
      const messages = await ExploitPatch.numbercolon(messagesStr);
      
      // Delete messages sent by the user
      await db.query<ResultSetHeader>(
        `DELETE FROM messages WHERE messageID IN (${messages}) AND accID = ? LIMIT 10`, 
        [accountID]
      );
      
      // Delete messages received by the user
      await db.query<ResultSetHeader>(
        `DELETE FROM messages WHERE messageID IN (${messages}) AND toAccountID = ? LIMIT 10`, 
        [accountID]
      );
      
      ConsoleApi.Log("main", `Messages deleted`);
      return "1";
    } else {
      // Delete a single message
      await db.query<ResultSetHeader>(
        "DELETE FROM messages WHERE messageID = ? AND accID = ? LIMIT 1", 
        [messageID, accountID]
      );
      
      await db.query<ResultSetHeader>(
        "DELETE FROM messages WHERE messageID = ? AND toAccountID = ? LIMIT 1", 
        [messageID, accountID]
      );
      
      ConsoleApi.Log("main", `Message deleted`);
      return "1";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.deleteMessages`);
    return "-1";
  }
};

export default deleteMessages;