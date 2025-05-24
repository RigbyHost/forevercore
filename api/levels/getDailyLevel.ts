'package net.fimastgd.forevercore.api.levels.getDailyLevel';

import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Gets current daily or weekly level info
 * @param typeStr - Type (0 = daily, 1 = weekly, 2 = event)
 * @param weeklyStr - Alternative weekly flag
 * @returns Formatted daily level string, "-1" if failed
 */
const getDailyLevel = async (
  typeStr?: string,
  weeklyStr?: string
): Promise<string> => {
  try {
    // Determine if this is a daily or weekly request
    const type = typeStr || weeklyStr || "0";
    
    // Calculate when the level will reset
    const midnight = type == "1" 
      ? getNextMonday() 
      : getTomorrow();
    
    const current = Math.floor(Date.now() / 1000);
    
    // Query database for current featured level
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT feaID FROM dailyfeatures WHERE timestamp < ? AND type = ? ORDER BY timestamp DESC LIMIT 1", 
      [current, type]
    );
    
    if (rows.length === 0) {
      return "-1";
    }
    
    // Calculate remaining time and feature ID
    let dailyID = rows[0].feaID;
    if (type == "1") dailyID += 100001;
    
    const timeleft = Math.floor(midnight.getTime() / 1000) - current;
    
    ConsoleApi.Log("main", `Received daily level. ID: ${dailyID}, timeleft: ${timeleft}`);
    return `${dailyID}|${timeleft}`;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.getDailyLevel`);
    return "-1";
  }
};

/**
 * Calculates the date of the next Monday
 * @returns Date object for next Monday at midnight
 */
function getNextMonday(): Date {
  const date = new Date();
  date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Calculates tomorrow's date
 * @returns Date object for tomorrow at midnight
 */
function getTomorrow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default getDailyLevel;