import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import db from '../../serverconf/db-proxy';
import ConsoleApi from '../../modules/console-api';

/**
 * Likes an item (level, comment, etc) in Geometry Dash
 * @param typeStr - Item type (1=level, 2=comment, 3=account comment, 4=list)
 * @param likeStr - Like value (1=like, 0=dislike)
 * @param itemIDStr - Item ID
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const likeItem = async (
  typeStr?: string,
  likeStr?: string,
  itemIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    if (!req?.body?.itemID) {
      return "-1";
    }
    
    // Process parameters
    const type = typeStr ? parseInt(typeStr) : 1;
    const itemID = await ExploitPatch.remove(itemIDStr);
    const isLike = likeStr ? parseInt(likeStr) : 1;
    const ip = await ApiLib.getIP(req);
    
    // Check if user already liked this item
    const [countResult] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM actions_likes WHERE itemID = ? AND type = ? AND ip = INET6_ATON(?)", 
      [itemID, type, ip]
    );
    
    if (countResult[0].count > 2) {
      return "-1";
    }
    
    // Record like action
    await db.execute<ResultSetHeader>(
      "INSERT INTO actions_likes (itemID, type, isLike, ip) VALUES (?, ?, ?, INET6_ATON(?))", 
      [itemID, type, isLike, ip]
    );
    
    // Determine table and column based on item type
    let table: string, column: string;
    
    switch (type.toString()) {
      case "1":
        table = "levels";
        column = "levelID";
        break;
      case "2":
        table = "comments";
        column = "commentID";
        break;
      case "3":
        table = "acccomments";
        column = "commentID";
        break;
      case "4":
        table = "lists";
        column = "listID";
        break;
      default:
        throw new Error("Invalid type");
    }
    
    // Get current likes
    const [likesResult] = await db.execute<RowDataPacket[]>(
      `SELECT likes FROM ${table} WHERE ${column} = ? LIMIT 1`, 
      [itemID]
    );
    
    // Update likes count
    const sign = (isLike == 1) ? "+" : "-";
    await db.execute<ResultSetHeader>(
      `UPDATE ${table} SET likes = likes ${sign} 1 WHERE ${column} = ?`, 
      [itemID]
    );
    
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.other.likeItem`);
    return "-1";
  }
};

export default likeItem;