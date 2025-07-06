import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for message data
 */
interface MessageData extends RowDataPacket {
  accID: number;
  toAccountID: number;
  timestamp: number;
  userName: string;
  messageID: number;
  subject: string;
  isNew: number;
  body: string;
}

/**
 * Interface for user data
 */
interface UserData extends RowDataPacket {
  userName: string;
  userID: number;
  extID: number;
}

/**
 * Downloads a message from a GD user's inbox
 * @param messageIDStr - Message ID to download
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param isSenderStr - Whether to get sender's view of message
 * @param req - Express request
 * @returns Formatted message string or "-1" if failed
 */
const downloadMessage = async (
  messageIDStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  isSenderStr?: string,
  req?: Request
): Promise<string> => {
  try {
    let accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const messageID = await ExploitPatch.remove(messageIDStr);
    
    // Get message data
    const [messages] = await db.query<MessageData[]>(
      `SELECT accID, toAccountID, timestamp, userName, messageID, subject, isNew, body 
       FROM messages 
       WHERE messageID = ? AND (accID = ? OR toAccountID = ?) 
       LIMIT 1`, 
      [messageID, accountID, accountID]
    );
    
    if (messages.length === 0) {
      return "-1";
    }
    
    const result = messages[0];
    let isSender: number;
    
    // Handle sender vs receiver view
    if (!isSenderStr) {
      // Mark message as read
      await db.query<ResultSetHeader>(
        "UPDATE messages SET isNew=1 WHERE messageID = ? AND toAccountID = ?", 
        [messageID, accountID]
      );
      
      accountID = String(result.accID);
      isSender = 0;
    } else {
      isSender = 1;
      accountID = String(result.toAccountID);
    }
    
    // Get user data
    const [users] = await db.query<UserData[]>(
      "SELECT userName, userID, extID FROM users WHERE extID = ?", 
      [accountID]
    );
    
    const result12 = users[0];
    
    // Format date
    const uploadDate = new Date(result.timestamp * 1000)
      .toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
      .replace(/:/g, ".")
      .replace(",", "");
    
    // Format response
    const response = `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${result.messageID}:4:${result.subject}:8:${result.isNew}:9:${isSender}:5:${result.body}:7:${uploadDate}`;
    
    ConsoleApi.Log("main", `Message downloaded`);
    return response;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.downloadMessage`);
    return "-1";
  }
};

export default downloadMessage;