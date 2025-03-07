import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GeneratePass from '../lib/generatePass';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for account backup result
 */
interface BackupResult {
  orbs: string;
  lvls: string;
}

/**
 * Backs up a GD account
 * @param userNameOr - Username
 * @param passwordOr - Password
 * @param saveDataOr - Save data
 * @param accountIDOr - Account ID
 * @param gjp2Or - GJP2 hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const backupAccount = async (
  userNameOr?: string,
  passwordOr?: string,
  saveDataOr?: string,
  accountIDOr?: string,
  gjp2Or?: string,
  req?: Request
): Promise<string> => {
  try {
    // Clear any timeout if exists
    if (typeof setTimeout === "function") {
      setTimeout(() => {}, 0);
    }

    // Get username if not provided
    let userName: string | null = null;
    if (typeof userNameOr === "undefined") {
      const [rows] = await db.execute<any[]>(
        "SELECT userName FROM accounts WHERE accountID = ?", 
        [accountIDOr]
      );
      userName = rows.length ? rows[0].accountID : null;
    } else {
      userName = await ExploitPatch.remove(userNameOr);
    }

    const password = passwordOr || "";
    const saveData = await ExploitPatch.remove(saveDataOr);

    // Get account ID
    let accountID: string | number | null;
    if (!accountIDOr) {
      const [rows] = await db.execute<any[]>(
        "SELECT accountID FROM accounts WHERE userName = ?", 
        [userName]
      );
      accountID = rows.length ? rows[0].accountID : null;
    } else {
      accountID = ExploitPatch.remove(accountIDOr);
    }

    // Validate account ID
    if (!isFinite(Number(accountID))) {
      ConsoleApi.Log("main", `Failed to backup account: ${accountID}`);
      return "-1";
    }

    // Check password
    let pass = 0;
    if (passwordOr) {
      pass = await GeneratePass.isValid(accountIDOr, passwordOr, req);
    } else if (gjp2Or) {
      pass = await GeneratePass.isGJP2Valid(accountIDOr, gjp2Or, req);
    }

    if (pass === 1) {
      // Process save data
      let saveDataArr = saveDataOr.split(";");
      let saveDataDecoded = saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/");
      saveDataDecoded = Buffer.from(saveDataDecoded, "base64").toString();
      saveDataDecoded = require("zlib").gunzipSync(saveDataDecoded).toString();

      // Extract orbs and levels from save data
      let orbs = saveDataDecoded.split("</s><k>14</k><s>")[1].split("</s>")[0];
      let lvls = saveDataDecoded.split("<k>GS_value</k>")[1].split("</s><k>4</k><s>")[1].split("</s>")[0];

      // Mask password in save data
      saveDataDecoded = saveDataDecoded.replace(
        `<k>GJA_002</k><s>${passwordOr}</s>`, 
        "<k>GJA_002</k><s>password</s>"
      );
      
      // Compress and encode save data
      saveDataDecoded = require("zlib").gzipSync(saveDataDecoded).toString("base64");
      saveDataDecoded = saveDataDecoded.replace(/\+/g, "-").replace(/\//g, "_");
      saveDataDecoded = saveDataDecoded + ";" + saveDataArr[1];

      // Write save data to file
      const accountsPath = path.join("./data/accounts", `${accountIDOr}.dat`);
      const accountsKeyPath = path.join("./data/accounts/keys", `${accountIDOr}`);
      await fs.writeFile(`${accountsPath}`, saveDataDecoded);
      await fs.writeFile(`${accountsKeyPath}`, "");

      // Get user ID and update orbs and levels
      let userNameFin: string;
      let extID: string;
      
      if (userNameOr) {
        const [rows] = await db.execute<any[]>(
          "SELECT extID FROM users WHERE userName = ? LIMIT 1", 
          [userNameOr]
        );
        extID = rows[0].extID;
        await db.execute(
          "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE extID = ?", 
          [orbs, lvls, extID]
        );
      } else {
        const [rows] = await db.execute<any[]>(
          "SELECT userName FROM users WHERE extID = ? LIMIT 1", 
          [accountIDOr]
        );
        userNameFin = rows[0].userName;
        await db.execute(
          "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE userName = ?", 
          [orbs, lvls, userNameFin]
        );
      }

      ConsoleApi.Log("main", `Account backuped. ID: ${accountID}`);
      return "1";
    } else {
      ConsoleApi.Log("main", `Failed to backup account. ID: ${accountID}`);
      return "-1";
    }
  } catch (err) {
    ConsoleApi.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.backup`);
    return "-1";
  }
};

export default backupAccount;