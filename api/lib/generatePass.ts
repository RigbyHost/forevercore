import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../../serverconf/db';
import ApiLib from './apiLib';
import FixIp from './fixIp';
import ConsoleApi from '../../modules/console-api';

/**
 * Utility class for password generation and validation
 */
class GeneratePass {
  /**
   * Generate GJP2 hash from password
   * @param pass - Password to hash
   * @param req - Express request (optional)
   * @returns GJP2 hash
   */
  static GJP2fromPassword(pass: string, req: Request = {} as Request): string {
    return crypto.createHash('sha1').update(pass + "mI29fmAnxgTs").digest('hex');
  }

  /**
   * Generate bcrypt hash from GJP2 hash
   * @param pass - Password to hash
   * @param req - Express request (optional)
   * @returns Bcrypt hash
   */
  static GJP2hash(pass: string, req: Request = {} as Request): string {
    const hash = this.GJP2fromPassword(pass, req);
    return bcrypt.hashSync(hash, 10);
  }

  /**
   * Count login attempts from IP
   * @param req - Express request
   * @returns Number of attempts
   */
  static async attemptsFromIP(req: Request): Promise<number> {
    const ip = await FixIp.getIP(req);
    const newtime = Math.floor(Date.now() / 1000) - (60 * 60);
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?",
      [newtime, ip]
    );
    return rows[0].count;
  }

  /**
   * Check if IP has too many login attempts
   * @param req - Express request
   * @returns True if too many attempts
   */
  static async tooManyAttemptsFromIP(req: Request): Promise<boolean> {
    return await this.attemptsFromIP(req) > 7;
  }

  /**
   * Assign mod IPs to account
   * @param accountID - Account ID
   * @param ip - IP address
   * @param req - Express request (optional)
   */
  static async assignModIPs(accountID: number | string, ip: string, req?: Request): Promise<void> {
    const modipCategory = await ApiLib.getMaxValuePermission(accountID, "modipCategory");
    if (modipCategory > 0) {
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT count(*) as count FROM modips WHERE accountID = ?", 
        [accountID]
      );
      
      if (rows[0].count > 0) {
        await db.execute(
          "UPDATE modips SET IP = ?, modipCategory = ? WHERE accountID = ?", 
          [ip, modipCategory, accountID]
        );
      } else {
        await db.execute(
          "INSERT INTO modips (IP, accountID, isMod, modipCategory) VALUES (?, ?, '1', ?)", 
          [ip, accountID, modipCategory]
        );
      }
    }
  }

  /**
   * Log invalid login attempt from IP
   * @param accid - Account ID
   * @param req - Express request
   */
  static async logInvalidAttemptFromIP(accid: number | string, req: Request): Promise<void> {
    const ip = await FixIp.getIP(req);
    const time = Math.floor(Date.now() / 1000);
    await db.execute(
      "INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)",
      [accid, time, ip]
    );
  }

  /**
   * Validate GJP2 hash against account ID
   * @param accid - Account ID
   * @param gjp2 - GJP2 hash
   * @param req - Express request
   * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
   */
  static async isGJP2Valid(accid: number | string, gjp2: string, req: Request): Promise<number> {
    if (await this.tooManyAttemptsFromIP(req)) { 
      return -1;
    } 
    
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT gjp2, isActive FROM accounts WHERE accountID = ?", 
      [accid]
    );
    
    if (rows.length == 0) {
      return 0;
    } 

    const userInfo = rows[0];
    if (!userInfo.gjp2) return -2;

    const isPasswordValid = await bcrypt.compare(gjp2, userInfo.gjp2);
    
    if (isPasswordValid) {
      await this.assignModIPs(accid, FixIp.getIP(req), req);
      return userInfo.isActive ? 1 : -2;
    } else {
      await this.logInvalidAttemptFromIP(accid, req);
      return 0;
    }
  }

  /**
   * Assign GJP2 hash to account
   * @param accid - Account ID
   * @param pass - Password
   * @param req - Express request (optional)
   * @returns Database result
   */
  static async assignGJP2(accid: number | string, pass: string, req?: Request): Promise<any> {
    const query = "UPDATE accounts SET gjp2 = ? WHERE accountID = ?";
    const gjp2 = await this.GJP2hash(pass, req || {} as Request);
    
    try {
      const [results] = await db.execute<ResultSetHeader>(query, [gjp2, accid]);
      return results;
    } catch (error) {
      ConsoleApi.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.generatePass`);
      return "-1";
    }
  }

  /**
   * Validate GJP2 hash against username
   * @param userName - Username
   * @param gjp2 - GJP2 hash
   * @param req - Express request
   * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
   */
  static async isGJP2ValidUsrname(userName: string, gjp2: string, req: Request): Promise<number> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT accountID FROM accounts WHERE userName LIKE ?", 
        [userName]
      );
      
      if (rows.length == 0) {
        return 0;
      }
      
      const accID = rows[0].accountID;
      return await this.isGJP2Valid(accID, gjp2, req);
    } catch (error) {
      ConsoleApi.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.generatePass`);
      return 0;
    }
  }

  /**
   * Validate password against account ID
   * @param accid - Account ID
   * @param pass - Password
   * @param req - Express request
   * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
   */
  static async isValid(accid: number | string, pass: string, req: Request): Promise<number> {
    if (await this.tooManyAttemptsFromIP(req)) return -1;

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT accountID, salt, password, isActive, gjp2 FROM accounts WHERE accountID = ?", 
      [accid]
    );
    
    if (rows.length === 0) return 0;

    const result = rows[0];
    const isPasswordValid = await bcrypt.compare(pass, result.password);
    
    if (isPasswordValid) {
      if (!result.gjp2) await this.assignGJP2(accid, pass, req);
      await this.assignModIPs(accid, FixIp.getIP(req), req);
      return result.isActive ? 1: -2;
    } else {
      await this.logInvalidAttemptFromIP(accid, req);
      return 0;
    }
  }

  /**
   * Validate password against username
   * @param userName - Username
   * @param pass - Password
   * @param req - Express request
   * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
   */
  static async isValidUsrname(userName: string, pass: string, req: Request): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT accountID FROM accounts WHERE userName LIKE ?", 
      [userName]
    );
    
    if (rows.length === 0) return 0;

    const accID = rows[0].accountID;
    return await this.isValid(accID, pass, req);
  }
}

export default GeneratePass;