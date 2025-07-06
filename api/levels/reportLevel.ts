'package net.fimastgd.forevercore.api.levels.reportLevel';

import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import FixIp from '../lib/fixIp';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';

/**
 * Reports a level in Geometry Dash
 * @param levelIDStr - Level ID to report
 * @param req - Express request
 * @returns Report ID if successful, "-1" if failed
 */
const reportLevel = async (
  levelIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    if (!levelIDStr) {
      ConsoleApi.Log("main", `Failed to report unknown level`);
      return "-1";
    }
    
    const levelID = await ExploitPatch.remove(levelIDStr);
    const ip = await FixIp.getIP(req);
    
    // Check if user already reported this level
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM reports WHERE levelID = ? AND hostname = ?", 
      [levelID, ip]
    );

    if (rows[0].count == 0) {
      // Submit new report
      const [result] = await db.execute<ResultSetHeader>(
        "INSERT INTO reports (levelID, hostname) VALUES (?, ?)", 
        [levelID, ip]
      );
      
      return result.insertId.toString();
    } else {
      ConsoleApi.Log("main", `Failed to report level: report from this IP already exists`);
      return "-1";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.reportLevel`);
    return "-1";
  }
};

export default reportLevel;