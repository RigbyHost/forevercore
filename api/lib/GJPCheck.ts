"package net.fimastgd.forevercore.api.lib.GJPCheck";

import { Request } from "express";
import { Connection, RowDataPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import XORCipher from "./XORCipher";
import ApiLib from "./apiLib";
import { getSettings } from "../../serverconf/settings";
import ExploitPatch from "./exploitPatch";
import FixIp from "./fixIp";
import bcrypt from "bcrypt";
import crypto from "crypto";
import ConsoleApi from "../../modules/console-api";

/**
 * Utility class for GJP password checks and account validation
 */
class GJPCheck {
	/**
	 * Check GJP hash against account ID
	 * @param gjp - GJP hash
	 * @param accountID - Account ID to check
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	static async check(gdpsid: string, gjp: string, accountID: number | string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		// Check session grants to bypass auth
		if (await getSettings(gdpsid).sessionGrants) {
			const ip = await FixIp.getIP(req);
			const [rows] = await db.execute<RowDataPacket[]>(
				"SELECT count(*) as count FROM actions WHERE type = 16 AND value = ? AND value2 = ? AND timestamp > ?",
				[accountID, ip, Math.floor(Date.now() / 1000) - 3600]
			);

			if (rows[0].count > 0) {
				return 1;
			}
		}
		// Decode GJP
		let gjpdecode = gjp.replace(/_/g, "/").replace(/-/g, "+");
		gjpdecode = Buffer.from(gjpdecode, "base64").toString("binary");
		gjpdecode = await XORCipher.cipher(gjpdecode, 37526);

		// Validate credentials
		const validationResult = await this.isValid(gdpsid, accountID, gjpdecode, req);

		// Store session grant if enabled and auth successful
		if (validationResult === 1 && await getSettings(gdpsid).sessionGrants) {
			const ip = await FixIp.getIP(req);
			await db.execute("INSERT INTO actions (type, value, value2, timestamp) VALUES (16, ?, ?, ?)", [
				accountID,
				ip,
				Math.floor(Date.now() / 1000)
			]);
		}

		return validationResult;
	}

	/**
	 * Validate GJP or respond with error
	 * @param gjp - GJP hash
	 * @param accountID - Account ID to check
	 * @param req - Express request
	 * @returns Promise that resolves if valid, or rejects with "-1"
	 */
	static async validateGJPOrDie(gdpsid: string, gjp: string, accountID: string | number, req: Request): Promise<void> {
		const result = await this.check(gdpsid, gjp, accountID, req);
		if (result !== 1) {
			throw new Error("-1");
		}
	}

	/**
	 * Validate GJP2 hash or respond with error
	 * @param gjp2 - GJP2 hash
	 * @param accountID - Account ID to check
	 * @param req - Express request
	 * @returns Promise that resolves if valid, or rejects with "-1"
	 */
	static async validateGJP2OrDie(gdpsid: string, gjp2: string, accountID: string | number, req: Request): Promise<void> {
		const result = await this.isGJP2Valid(gdpsid, accountID, gjp2, req);
		if (result !== 1) {
			throw new Error("-1");
		}
	}

	/**
	 * Get account ID from request params or return error
	 * @param accountIDStr - Account ID string
	 * @param gjp2Str - GJP2 hash
	 * @param gjpStr - GJP hash
	 * @param req - Express request
	 * @returns Account ID if valid, "-1" if invalid
	 */
	static async getAccountIDOrDie(gdpsid: string, accountIDStr?: string, gjp2Str?: string, gjpStr?: string, req?: Request): Promise<string> {
		if (!accountIDStr) {
			return "-1";
		}

		const accountID = await ExploitPatch.remove(accountIDStr);

		if (gjpStr) {
			await this.validateGJPOrDie(gdpsid, gjpStr, accountID, req);
		} else if (gjp2Str) {
			await this.validateGJP2OrDie(gdpsid, gjp2Str, accountID, req);
		} else {
			return "-1";
		}

		return accountID;
	}

	// NEXT: GeneratePass functionality to avoid circular dependency

	/**
	 * Generate GJP2 hash from password
	 * @param pass - Password to hash
	 * @param req - Express request (optional)
	 * @returns GJP2 hash
	 */
	static async GJP2fromPassword(gdpsid: string, pass: string, req: Request = {} as Request): Promise<string> {
		return crypto
			.createHash("sha1")
			.update(pass + "mI29fmAnxgTs")
			.digest("hex");
	}

	/**
	 * Generate bcrypt hash from GJP2 hash
	 * @param pass - Password to hash
	 * @param req - Express request (optional)
	 * @returns Bcrypt hash
	 */
	static async GJP2hash(gdpsid: string, pass: string, req: Request = {} as Request): Promise<string> {
		const hash = await this.GJP2fromPassword(gdpsid, pass, req);
		return bcrypt.hashSync(hash, 10);
	}

	/**
	 * Count login attempts from IP
	 * @param req - Express request
	 * @returns Number of attempts
	 */
	static async attemptsFromIP(gdpsid: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		const ip = await FixIp.getIP(req);
		const newtime = Math.floor(Date.now() / 1000) - 60 * 60;

		const [rows] = await db.execute<RowDataPacket[]>("SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?", [
			newtime,
			ip
		]);

		return rows[0].count;
	}

	/**
	 * Check if IP has too many login attempts
	 * @param req - Express request
	 * @returns True if too many attempts
	 */
	static async tooManyAttemptsFromIP(gdpsid: string, req: Request): Promise<boolean> {
		return (await this.attemptsFromIP(gdpsid, req)) > 7;
	}

	/**
	 * Assign mod IPs to account
	 * @param accountID - Account ID
	 * @param ip - IP address
	 * @param req - Express request (optional)
	 */
	static async assignModIPs(gdpsid: string, accountID: string | number, ip: string, req?: Request): Promise<void> {
		const db = await threadConnection(gdpsid);
		const modipCategory = await ApiLib.getMaxValuePermission(gdpsid, accountID, "modipCategory");

		if (typeof modipCategory === "number" && modipCategory > 0) {
			const [rows] = await db.execute<RowDataPacket[]>("SELECT count(*) as count FROM modips WHERE accountID = ?", [accountID]);

			if (rows[0].count > 0) {
				await db.execute("UPDATE modips SET IP = ?, modipCategory = ? WHERE accountID = ?", [ip, modipCategory, accountID]);
			} else {
				await db.execute("INSERT INTO modips (IP, accountID, isMod, modipCategory) VALUES (?, ?, '1', ?)", [ip, accountID, modipCategory]);
			}
		}
	}

	/**
	 * Log invalid login attempt from IP
	 * @param accid - Account ID
	 * @param req - Express request
	 */
	static async logInvalidAttemptFromIP(gdpsid: string, accid: string | number, req: Request): Promise<void> {
		const db = await threadConnection(gdpsid);
		const ip = await FixIp.getIP(req);
		const time = Math.floor(Date.now() / 1000);

		await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)", [accid, time, ip]);
	}

	/**
	 * Validate GJP2 hash against account ID
	 * @param accid - Account ID
	 * @param gjp2 - GJP2 hash
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	static async isGJP2Valid(gdpsid: string, accid: string | number, gjp2: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		if (await this.tooManyAttemptsFromIP(gdpsid, req)) {
			return -1;
		}

		const [rows] = await db.execute<RowDataPacket[]>("SELECT gjp2, isActive FROM accounts WHERE accountID = ?", [accid]);

		if (rows.length === 0) return 0;

		const userInfo = rows[0];
		if (!userInfo.gjp2) return -2;

		const isPasswordValid = await bcrypt.compare(gjp2, userInfo.gjp2);

		if (isPasswordValid) {
			await this.assignModIPs(gdpsid, accid, FixIp.getIP(req), req);
			return userInfo.isActive ? 1 : -2;
		} else {
			await this.logInvalidAttemptFromIP(gdpsid, accid, req);
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
	static async assignGJP2(gdpsid: string, accid: string | number, pass: string, req?: Request): Promise<any> {
		const db = await threadConnection(gdpsid);
		const gjp2 = await this.GJP2hash(gdpsid, pass, req);

		try {
			const [results] = await db.execute("UPDATE accounts SET gjp2 = ? WHERE accountID = ?", [gjp2, accid]);

			return results;
		} catch (error) {
			ConsoleApi.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
			throw error;
		}
	}

	/**
	 * Validate GJP2 hash against username
	 * @param userName - Username
	 * @param gjp2 - GJP2 hash
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	static async isGJP2ValidUsrname(gdpsid: string, userName: string, gjp2: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		try {
			const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);

			if (rows.length === 0) {
				return 0;
			}

			const accID = rows[0].accountID;
			return await this.isGJP2Valid(gdpsid, accID, gjp2, req);
		} catch (error) {
			ConsoleApi.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
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
	static async isValid(gdpsid: string, accid: string | number, pass: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		if (await this.tooManyAttemptsFromIP(gdpsid, req)) return -1;

		const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID, salt, password, isActive, gjp2 FROM accounts WHERE accountID = ?", [
			accid
		]);

		if (rows.length === 0) return 0;

		const result = rows[0];
		const isPasswordValid = await bcrypt.compare(pass, result.password);

		if (isPasswordValid) {
			if (!result.gjp2) await this.assignGJP2(gdpsid, accid, pass, req);
			await this.assignModIPs(gdpsid, accid, FixIp.getIP(req), req);
			return result.isActive ? 1 : -2;
		} else {
			await this.logInvalidAttemptFromIP(gdpsid, accid, req);
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
	static async isValidUsrname(gdpsid: string, userName: string, pass: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);

		if (rows.length === 0) return 0;

		const accID = rows[0].accountID;
		return await this.isValid(gdpsid, accID, pass, req);
	}
}

export default GJPCheck;
