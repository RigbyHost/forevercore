import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import GeneratePass from '../lib/generatePass';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';

// This would be imported from a proper module in a real implementation
interface KeyProtectedByPassword {
  loadFromAsciiSafeString(encoded: string): KeyProtectedByPassword;
  unlockKey(password: string): Buffer;
}

/**
 * Syncs a GD account save data
 * @param userNameStr - Username
 * @param accountIDStr - Account ID
 * @param passwordStr - Password
 * @param gjp2Str - GJP2 hash
 * @param req - Express request
 * @returns Save data if successful, "-1" if failed, "-2" if invalid password, "-3" if file system error
 */
const syncAccount = async (
  userNameStr?: string,
  accountIDStr?: string,
  passwordStr?: string,
  gjp2Str?: string,
  req?: Request
): Promise<string> => {
  try {
    const password = passwordStr || "";
    let accountID = accountIDStr || "";

    // Define paths for save data
    const accountsPath = path.join("./data/accounts", `${accountIDStr}.dat`);
    const accountsKeyPath = path.join("./data/accounts/keys", `${accountIDStr}`);

    /**
     * Get account ID from username
     * @param userName - Username
     * @returns Account ID or null
     */
    async function getAccountID(userName: string): Promise<string | null> {
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT accountID FROM accounts WHERE userName = ?", 
        [userName]
      );
      return rows.length ? rows[0].accountID : null;
    }

    /**
     * Check if value is numeric
     * @param value - Value to check
     * @returns True if numeric
     */
    function isNumeric(value: string): boolean {
      return /^\d+$/.test(value);
    }

    /**
     * Check if file exists
     * @param path - File path
     * @returns True if file exists
     */
    async function fileExists(path: string): Promise<boolean> {
      try {
        await fs.access(path);
        return true;
      } catch {
        return false;
      }
    }

    /**
     * Decrypt data with key
     * @param data - Encrypted data
     * @param key - Decryption key
     * @returns Decrypted data
     */
    function decrypt(data: string, key: Buffer): string {
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.alloc(16, 0));
      let decrypted = decipher.update(data, "base64", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }

    // Get account ID
    if (!accountID) {
      const userName = await ExploitPatch.remove(userNameStr);
      accountID = await getAccountID(userName);
    } else {
      accountID = await ExploitPatch.remove(accountIDStr);
    }

    // Verify credentials
    let pass = 0;
    if (passwordStr) {
      pass = await GeneratePass.isValid(accountID, passwordStr, req);
    } else if (gjp2Str) {
      pass = await GeneratePass.isGJP2Valid(accountID, gjp2Str, req);
    }

    if (pass == 1) {
      // Check if save data exists
      if (!(await fileExists(accountsPath))) {
        ConsoleApi.Log("main", `Failed to sync account ${accountIDStr}: save data not found`);
        return "-1";
      }

      // Read save data
      let saveData = await fs.readFile(accountsPath, 'utf8');
      
      // Handle protected save data
      if ((await fileExists(accountsKeyPath)) && !saveData.startsWith("H4s")) {
        // This is a simplified version - in real implementation you'd use the proper library
        const protectedKeyEncoded = await fs.readFile(accountsKeyPath, 'utf8');
        
        // This is a placeholder for actual key protection logic
        const KeyProtectedByPassword = {
          loadFromAsciiSafeString: function(str: string) { return this; },
          unlockKey: function(pass: string) { return Buffer.from('dummyKey'); }
        };
        
        const protectedKey = KeyProtectedByPassword.loadFromAsciiSafeString(protectedKeyEncoded);
        const userKey = protectedKey.unlockKey(password);

        try {
          saveData = decrypt(saveData, userKey);
          await fs.writeFile(accountsPath, saveData, 'utf8');
          await fs.writeFile(accountsKeyPath, '', 'utf8');
        } catch (err) {
          ConsoleApi.Error("main", "Server returned \"-3\" - file system exception at net.fimastgd.forevercore.api.accounts.sync");
          return "-3";
        }
      }
      
      ConsoleApi.Log("main", `Synced account: ${accountIDStr}`);
      return `${saveData};21;30;a;a`;
    } else {
      ConsoleApi.Log("main", `Failed to sync account: ${accountIDStr} - invalid pass`);
      return "-2";
    }
  } catch (error) {
    ConsoleApi.Warn("main", `Check the data for damage at net.fimastgd.forevercore.api.accounts.sync`);
    ConsoleApi.Error("main", `Unhandled server exception with user sync account, automatic protection trying to not calling at net.fimastgd.forevercore.api.accounts.sync\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.sync`);
    return "-1";
  }
};

export default syncAccount;