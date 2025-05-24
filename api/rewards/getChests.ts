import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import { smallChest, bigChest } from '../../serverconf/chests';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import XORCipher from '../lib/XORCipher';
import GenerateHash from '../lib/generateHash';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for chest settings
 */
interface ChestSettings {
  minOrbs: number;
  maxOrbs: number;
  minDiamonds: number;
  maxDiamonds: number;
  items: number[];
  minKeys: number;
  maxKeys: number;
  wait: number;
}

/**
 * Gets chest rewards for a GD user
 * @param chkStr - Check string
 * @param rewardTypeStr - Reward type (1=small chest, 2=big chest)
 * @param udidStr - Device ID
 * @param accountIDStr - Account ID
 * @param gameVersionStr - Game version
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns Encoded chest data or "-1" if failed
 */
const getChests = async (
  chkStr?: string,
  rewardTypeStr?: string,
  udidStr?: string,
  accountIDStr?: string,
  gameVersionStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Get user ID
    const extID = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
    
    // Process parameters
    const chk = await ExploitPatch.remove(chkStr);
    const rewardType = rewardTypeStr ? parseInt(await ExploitPatch.remove(rewardTypeStr)) : 0;
    const userid = await ApiLib.getUserID(extID);
    const udid = await ExploitPatch.remove(udidStr);
    const accountID = await ExploitPatch.remove(accountIDStr);
    
    // Decode check string
    const decodedChk = await XORCipher.cipher(
      Buffer.from(chk.substr(5), "base64").toString(), 
      59182
    );

    // Get user chest data
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT chest1time, chest1count, chest2time, chest2count FROM users WHERE extID = ?", 
      [extID]
    );

    // Current time and chest times
    let currenttime = Math.floor(Date.now() / 1000) + 100;
    let chest1time = user[0].chest1time;
    let chest1count = user[0].chest1count;
    let chest2time = user[0].chest2time;
    let chest2count = user[0].chest2count;
    
    // Calculate time remaining
    let chest1diff = currenttime - chest1time;
    let chest2diff = currenttime - chest2time;

    // Get chest settings
    const chest1items = smallChest.items;
    const chest2items = bigChest.items;
    const chest1minOrbs = smallChest.minOrbs;
    const chest1maxOrbs = smallChest.maxOrbs;
    const chest1minDiamonds = smallChest.minDiamonds;
    const chest1maxDiamonds = smallChest.maxDiamonds;
    const chest1minKeys = smallChest.minKeys;
    const chest1maxKeys = smallChest.maxKeys;
    const chest2minOrbs = bigChest.minOrbs;
    const chest2maxOrbs = bigChest.maxOrbs;
    const chest2minDiamonds = bigChest.minDiamonds;
    const chest2maxDiamonds = bigChest.maxDiamonds;
    const chest2minKeys = bigChest.minKeys;
    const chest2maxKeys = bigChest.maxKeys;
    const chest1wait = smallChest.wait;
    const chest2wait = bigChest.wait;

    // Generate random rewards
    const chest1stuff = `${Math.floor(Math.random() * (chest1maxOrbs - chest1minOrbs + 1) + chest1minOrbs)},${Math.floor(Math.random() * (chest1maxDiamonds - chest1minDiamonds + 1) + chest1minDiamonds)},${chest1items[Math.floor(Math.random() * chest1items.length)]},${Math.floor(Math.random() * (chest1maxKeys - chest1minKeys + 1) + chest1minKeys)}`;
    const chest2stuff = `${Math.floor(Math.random() * (chest2maxOrbs - chest2minOrbs + 1) + chest2minOrbs)},${Math.floor(Math.random() * (chest2maxDiamonds - chest2minDiamonds + 1) + chest2minDiamonds)},${chest2items[Math.floor(Math.random() * chest2items.length)]},${Math.floor(Math.random() * (chest2maxKeys - chest2minKeys + 1) + chest2minKeys)}`;

    // Calculate time left
    let chest1left = Math.max(0, chest1wait - chest1diff);
    let chest2left = Math.max(0, chest2wait - chest2diff);

    // Process reward claim
    if (rewardType == 1) {
      if (chest1left != 0) {
        return "-1";
      }
      chest1count++;
      await db.query<ResultSetHeader>(
        "UPDATE users SET chest1count = ?, chest1time = ? WHERE userID = ?", 
        [chest1count, currenttime, userid]
      );
      chest1left = chest1wait;
    }
    
    if (rewardType == 2) {
      if (chest2left != 0) {
        return "-1";
      }
      chest2count++;
      await db.query<ResultSetHeader>(
        "UPDATE users SET chest2count = ?, chest2time = ? WHERE userID = ?", 
        [chest2count, currenttime, userid]
      );
      chest2left = chest2wait;
    }

    // Encode response
    const stringToEncode = `1:${userid}:${decodedChk}:${udid}:${accountID}:${chest1left}:${chest1stuff}:${chest1count}:${chest2left}:${chest2stuff}:${chest2count}:${rewardType}`;
    let string = Buffer.from(await XORCipher.cipher(stringToEncode, 59182)).toString("base64");
    string = string.replace(/\//g, "_").replace(/\+/g, "-");
    
    // Generate hash
    const hash = await GenerateHash.genSolo4(string);
    
    ConsoleApi.Log("main", "Received chests");
    return `SaKuJ${string}|${hash}`;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.rewards.getChests`);
    return "-1";
  }
};

export default getChests;