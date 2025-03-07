import { RowDataPacket } from 'mysql2/promise';
import axios from 'axios';
import ExploitPatch from '../lib/exploitPatch';
import db from '../../serverconf/db';
import ApiLib from '../lib/apiLib';
import ConsoleApi from '../../modules/console-api';
import { apiURL } from '../../serverconf/api';

/**
 * Interface for quest data
 */
interface Quest extends RowDataPacket {
  type: number;
  amount: number;
  reward: number;
  name: string;
}

/**
 * Gets quests/challenges for a GD user
 * @param accountIDStr - Account ID
 * @param udidStr - Device ID
 * @param chkStr - Check string
 * @returns Challenge data from API
 */
const getChallenges = async (
  accountIDStr?: string,
  udidStr?: string,
  chkStr?: string
): Promise<string> => {
  try {
    // Process parameters
    const udid = await ExploitPatch.remove(udidStr);
    const accountID = await ExploitPatch.remove(accountIDStr);
    
    // Validate UDID
    if (!isNaN(Number(udid))) {
      return "-1";
    }
    
    const chk = await ExploitPatch.remove(chkStr);
    
    // Get user ID
    let userID: string | number;
    if (accountID !== '0') {
      userID = await ApiLib.getUserID(accountID);
    } else {
      userID = await ApiLib.getUserID(udid);
    }
    
    // Get available quests
    const [rows] = await db.query<Quest[]>("SELECT type, amount, reward, name FROM quests");
    
    // Get challenges from external API
    const url = apiURL.getChallenges;
    const params = {
      accountID: accountID,
      userID: userID,
      udid: udid,
      chk: chk,
      result: rows
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    
    const response = await axios.post(url, params, config);
    const API_RESPONSE = response.data;
    
    ConsoleApi.Log("main", "Received challenges from API");
    return API_RESPONSE;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.rewards.getChallenges`);
    return "-1";
  }
};

export default getChallenges;