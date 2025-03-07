'package net.fimastgd.forevercore.api.friendships.getFriendRequests';

import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for friend request data
 */
interface FriendRequest extends RowDataPacket {
  accountID: number | string;
  toAccountID: number | string;
  uploadDate: number;
  ID: number | string;
  comment: string;
  isNew: number | string;
}

/**
 * Interface for user data
 */
interface UserData extends RowDataPacket {
  userName: string;
  userID: number;
  icon: number;
  color1: number;
  color2: number;
  iconType: number;
  special: number;
  extID: number | string;
}

/**
 * Gets friend requests for a GD user
 * @param req - Express request with required parameters
 * @returns Formatted friend requests string, "-1" if failed, "-2" if no requests
 */
const getFriendRequests = async (req: Request): Promise<string> => {
  try {
    let reqstring = "";
    
    // Process parameters
    const getSent = !req.body.getSent ? 0 : await ExploitPatch.remove(req.body.getSent);
    const bcgjp = req.body.gameVersion > 21 ? req.body.gjp2 : req.body.gjp; // Backwards Compatible GJP
    
    if (!req.body.accountID || !req.body.page || isNaN(Number(req.body.page)) || !bcgjp) {
      ConsoleApi.Debug("main", "Friend requests error: POST params not found ");
      return "-1";
    }
    
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const page = await ExploitPatch.number(req.body.page);
    const offset = parseInt(page) * 10;

    // Determine query based on request type
    let query: string, countquery: string;
    
    if (getSent == 0) {
      query = "SELECT accountID, toAccountID, uploadDate, ID, comment, isNew FROM friendreqs WHERE toAccountID = ? LIMIT 10 OFFSET ?";
      countquery = "SELECT count(*) as count FROM friendreqs WHERE toAccountID = ?";
    } else if (getSent == 1) {
      query = "SELECT * FROM friendreqs WHERE accountID = ? LIMIT 10 OFFSET ?";
      countquery = "SELECT count(*) as count FROM friendreqs WHERE accountID = ?";
    } else {
      ConsoleApi.Log("main", "Friend requests not received: getSent not equal '0' or '1'");
      return "-1";
    }
    
    // Execute queries
    const [result] = await db.query<FriendRequest[]>(query, [accountID, offset]);
    const [countResult] = await db.query<RowDataPacket[]>(countquery, [accountID]);
    
    const reqcount = countResult[0].count;
    
    if (reqcount == 0) {
      ConsoleApi.Log("main", "Friend request not received: reqcount is 0");
      return "-2";
    }
    
    // Process each request
    for (const request of result) {
      const requester = getSent == 0 ? request.accountID : request.toAccountID;
      
      const [userResult] = await db.query<UserData[]>(
        "SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID = ?", 
        [requester]
      );
      
      const user = userResult[0];
      
      // Format upload date
      const uploadTime = new Date(request.uploadDate * 1000)
        .toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
        .replace(",", "")
        .replace(/:/g, ".");
      
      const extid = !isNaN(Number(user.extID)) ? user.extID : 0;
      
      // Build request string
      reqstring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:32:${request.ID}:35:${request.comment}:41:${request.isNew}:37:${uploadTime}|`;
    }
    
    // Remove trailing pipe and add metadata
    reqstring = reqstring.slice(0, -1);
    
    ConsoleApi.Log("main", `Received friend requests`);
    return `${reqstring}#${reqcount}:${offset}:10`;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getFriendRequests`);
    return "-1";
  }
};

export default getFriendRequests;