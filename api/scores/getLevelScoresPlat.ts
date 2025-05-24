'package net.fimastgd.forevercore.api.scores.getLevelScoresPlat';

import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for platformer level score data
 */
interface PlatScore extends RowDataPacket {
  accountID: number | string;
  timestamp: number;
  time: number;
  points: number;
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
  color3: number;
  iconType: number;
  special: number;
  extID: number | string;
  isBanned: number;
}

/**
 * Gets platformer level scores for Geometry Dash
 * @param req - Express request with parameters
 * @returns Formatted level scores string, "-1" if failed
 */
const getLevelScoresPlat = async (req: Request): Promise<string> => {
  try {
    // Authenticate user
    const accountID = parseInt(await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req));
    const levelID = await ExploitPatch.remove(req.body.levelID);
    
    // Get submitted score
    const scores = {
      time: parseInt(ExploitPatch.number(req.body.time)),
      points: await ExploitPatch.number(req.body.points)
    };
    
    const uploadDate = Math.floor(Date.now() / 1000);
    let lvlstr = "";
    
    // Determine score mode (time or points)
    const mode = req.body.mode == 1 ? "points" : "time";
    const order = mode == "time" ? "ASC" : "DESC";
    
    // UPDATING SCORE
    const [oldScoreRows] = await db.query<RowDataPacket[]>(
      `SELECT ${mode} FROM platscores WHERE accountID = ? AND levelID = ?`, 
      [accountID, levelID]
    );
    
    // Either insert new score or update if better
    if (oldScoreRows.length == 0) {
      if (scores.time > 0) {
        await db.query(
          "INSERT INTO platscores (accountID, levelID, time, timestamp) VALUES (?, ?, ?, ?)", 
          [accountID, levelID, scores.time, uploadDate]
        );
      }
    } else {
      const oldScore = oldScoreRows[0][mode];
      
      // Update if better score
      if (((mode == "time" && oldScore > scores.time) || 
          (mode == "points" && oldScore < scores.points)) && 
          scores.time > 0) {
        await db.query(
          `UPDATE platscores SET ${mode}=?, timestamp=? WHERE accountID=? AND levelID=?`, 
          [scores[mode], uploadDate, accountID, levelID]
        );
      }
    }
    
    // GETTING SCORES
    const type = req.body.type || 1;
    let query: string, queryArgs: any[];
    
    switch (parseInt(type.toString())) {
      case 0: // Friends
        const friends = await ApiLib.getFriends(accountID);
        friends.push(accountID);
        const friendsStr = friends.join(",");
        
        query = `SELECT * FROM platscores WHERE levelID = ? AND accountID IN (${friendsStr}) AND time > 0 ORDER BY ${mode} ${order}`;
        queryArgs = [levelID];
        break;
        
      case 1: // All players
        query = `SELECT * FROM platscores WHERE levelID = ? AND time > 0 ORDER BY ${mode} ${order}`;
        queryArgs = [levelID];
        break;
        
      case 2: // Weekly (recent scores)
        query = `SELECT * FROM platscores WHERE levelID = ? AND timestamp > ? AND time > 0 ORDER BY ${mode} ${order}`;
        queryArgs = [levelID, uploadDate - 604800]; // Last 7 days
        break;
        
      default:
        return "-1";
    }
    
    // Get scores
    const [scores2] = await db.query<PlatScore[]>(query, queryArgs);
    
    // Format response
    let x = 0;
    for (const score of scores2) {
      const extID = score.accountID;
      
      // Get user data
      const [userRows] = await db.query<UserData[]>(
        "SELECT userName, userID, icon, color1, color2, color3, iconType, special, extID, isBanned FROM users WHERE extID = ?", 
        [extID]
      );
      
      const user = userRows[0];
      
      // Skip banned users
      if (user.isBanned != 0) continue;
      
      x++;
      
      // Format date
      const time = new Date(score.timestamp * 1000)
        .toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
        .replace(",", "")
        .replace(/:/, ".");
      
      // Get score value based on mode
      const scoreType = score[mode];
      
      // Build score string
      lvlstr += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.color3}:16:${extID}:3:${scoreType}:6:${x}:42:${time}|`;
    }
    
    ConsoleApi.Log("main", `Received platformer level scores by accountID: ${accountID}`);
    return lvlstr.slice(0, -1); // Remove trailing pipe
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getLevelScoresPlat`);
    return "-1";
  }
};

export default getLevelScoresPlat;