import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for friendship data
 */
interface Friendship extends RowDataPacket {
  person1: number | string;
  person2: number | string;
  isNew1: number | string;
  isNew2: number | string;
}

/**
 * Interface for block data
 */
interface Block extends RowDataPacket {
  person1: number | string;
  person2: number | string;
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
 * Gets list of friends or blocked users for a GD user
 * @param req - Express request with required parameters
 * @returns Formatted user list string, "-1" if error, "-2" if no users
 */
const getUserList = async (req: Request): Promise<string> => {
  try {
    // Validate required parameters
    if (!req.body.type || isNaN(Number(req.body.type))) {
      ConsoleApi.Log("main", "Failed to get user list: req.body.type not a number or not defined");
      return "-1";
    }
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const type = await ExploitPatch.remove(req.body.type);
    
    let people = "";
    let peoplestring = "";
    const newMap = new Map<string | number, number | string>();
    
    // Determine query based on list type
    let query: string;
    if (type == 0) {
      // Friends list
      query = "SELECT person1, isNew1, person2, isNew2 FROM friendships WHERE person1 = ? OR person2 = ?";
    } else if (type == 1) {
      // Blocked users list
      query = "SELECT person1, person2 FROM blocks WHERE person1 = ?";
    } else {
      return "-1";
    }
    
    // Execute query
    const [result] = await db.query<Friendship[] | Block[]>(query, type == 0 ? [accountID, accountID] : [accountID]);
    
    if (result.length === 0) {
      ConsoleApi.Log("main", `User list is empty. accountID: ${accountID}`);
      return "-2";
    }
    
    // Process results
    for (const friendship of result) {
      let person: string | number = (friendship as Friendship).person1;
      let isnew: string | number = (friendship as Friendship).isNew1;
      
      if ((friendship as Friendship).person1 == accountID) {
        person = (friendship as Friendship).person2;
        isnew = (friendship as Friendship).isNew2;
      }
      
      newMap.set(person, isnew);
      people += person + ",";
    }
    
    people = people.slice(0, -1);
    
    // Get user data for each person
    const [users] = await db.query<UserData[]>(
      "SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID IN (?) ORDER BY userName ASC", 
      [people.split(",")]
    );
    
    // Format user data
    for (const user of users) {
      user.extID = !isNaN(Number(user.extID)) ? user.extID : 0;
      peoplestring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${user.extID}:18:0:41:${newMap.get(user.extID)}|`;
    }
    
    // Remove trailing pipe
    peoplestring = peoplestring.slice(0, -1);
    
    // Mark all "new" notifications as read
    await db.query("UPDATE friendships SET isNew1 = '0' WHERE person2 = ?", [accountID]);
    await db.query("UPDATE friendships SET isNew2 = '0' WHERE person1 = ?", [accountID]);
    
    if (peoplestring == "") {
      ConsoleApi.Log("main", `Failed to get user list: peoplestring is empty. accountID: ${accountID}`);
      return "-1";
    }
    
    ConsoleApi.Log("main", `Received user list. accountID: ${accountID}`);
    return peoplestring;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getUserList`);
    return "-1";
  }
};

export default getUserList;