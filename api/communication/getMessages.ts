import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for message data
 */
interface MessageData extends RowDataPacket {
  messageID: number;
  toAccountID: number;
  accID: number;
  subject: string;
  isNew: number;
  timestamp: number;
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
 * Gets messages for a GD user's inbox
 * @param pageStr - Page number
 * @param getSentStr - Whether to get sent messages (1) or received messages (0)
 * @param accountIDStr - Account ID of requester
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns Formatted messages string, "-1" if error, "-2" if no messages
 */
const getMessages = async (
  pageStr?: string,
  getSentStr?: string,
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    let msgstring = "";
    const toAccountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const page = await ExploitPatch.remove(pageStr);
    const offset = parseInt(page) * 10;
    
    let query: string, countquery: string, getSent: number;
    
    // Determine if getting sent or received messages
    if (!getSentStr || getSentStr != '1') {
      query = `SELECT * FROM messages WHERE toAccountID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
      countquery = "SELECT count(*) as count FROM messages WHERE toAccountID = ?";
      getSent = 0;
    } else {
      query = `SELECT * FROM messages WHERE accID = ? ORDER BY messageID DESC LIMIT 10 OFFSET ${offset}`;
      countquery = "SELECT count(*) as count FROM messages WHERE accID = ?";
      getSent = 1;
    }
    
    // Get messages
    const [result] = await db.query<MessageData[]>(query, [toAccountID]);
    
    // Get message count
    const [countResult] = await db.query<RowDataPacket[]>(countquery, [toAccountID]);
    const msgcount = countResult[0]["count(*)"];
    
    if (msgcount == 0) {
      return "-2";
    }
    
    // Process each message
    for (const message1 of result) {
      if (message1.messageID !== undefined) {
        // Format date
        const uploadDate = new Date(message1.timestamp * 1000)
          .toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })
          .replace(/,/, "").replace(/:/, ".");
        
        // Get the relevant account ID (sender or receiver based on view)
        const accountID = getSent == 1 ? message1.toAccountID : message1.accID;
        
        // Get user data
        const [userResult] = await db.query<UserData[]>(
          "SELECT * FROM users WHERE extID = ?", 
          [accountID]
        );
        
        const result12 = userResult[0];
        
        // Build message string
        msgstring += `6:${result12.userName}:3:${result12.userID}:2:${result12.extID}:1:${message1.messageID}:4:${message1.subject}:8:${message1.isNew}:9:${getSent}:7:${uploadDate}|`;
      }
    }
    
    // Remove trailing pipe and add metadata
    msgstring = msgstring.slice(0, -1);
    ConsoleApi.Log("main", `Received messages: ${msgcount}`);
    
    return `${msgstring}#${msgcount}:${offset}:10`;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.getMessages`);
    return "-1";
  }
};

export default getMessages;