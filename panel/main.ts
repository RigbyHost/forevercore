"package net.fimastgd.forevercore.panel.main";

import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request } from "express";
import threadConnection from "../serverconf/db";
import ApiLib from "../api/lib/apiLib";
import FixIp from "../api/lib/fixIp";
import ConsoleApi from "../modules/console-api";
import { networkInterfaces } from "os";

/**
 * Interface for MapPack data
 */
interface MapPackData {
	packName: string | undefined;
	levels: string | undefined;
	stars: number | undefined;
	coins: number | undefined;
	difficulty: number | undefined;
	rgbcolors: string | undefined;
}

/**
 * Interface for Gauntlet data
 */
interface GauntletData {
	level1: number | undefined;
	level2: number | undefined;
	level3: number | undefined;
	level4: number | undefined;
	level5: number | undefined;
}

/**
 * Main panel functionality class
 */
class Panel {
	/**
	 * Account management actions
	 * @param gdpsid - GDPS ID
	 * @param action - Action to perform
	 * @param username - Username to perform action on
	 * @returns Account ID or undefined
	 */
	public static async account(gdpsid: string, action: string, username: string): Promise<number | undefined> {
		const db = await threadConnection(gdpsid);
		if (action === "activate") {
			const query = `
            UPDATE accounts 
            SET isActive = 1 
            WHERE LOWER(userName) = LOWER(?)
            AND isActive = 0
            `;
			await db.execute(query, [username]);
			return;
		} else if (action === "getID") {
			const [rows] = await db.query<RowDataPacket[]>("SELECT accountID FROM accounts WHERE LOWER(userName) = LOWER(?)", [username]);
			const accountID = rows.length > 0 ? rows[0].accountID : null;
			return accountID;
		} else {
			throw new Error(`Incorrect value '${action}'!`);
		}
	}

	/**
	 * Generate GJP2 hash from password
	 * @param gdpsid - GDPS ID
	 * @param pass - Password to hash
	 * @param req - Express request (optional)
	 * @returns GJP2 hash
	 */
	private static GJP2fromPassword(gdpsid: string, pass: string, req: Request = {} as Request): string {
		return crypto
			.createHash("sha1")
			.update(pass + "mI29fmAnxgTs")
			.digest("hex");
	}

	/**
	 * Generate bcrypt hash from GJP2 hash
	 * @param gdpsid - GDPS ID
	 * @param pass - Password to hash
	 * @param req - Express request (optional)
	 * @returns Bcrypt hash
	 */
	public static GJP2hash(gdpsid: string, pass: string, req: Request = {} as Request): string {
		const hash = this.GJP2fromPassword(gdpsid, pass, req);
		return bcrypt.hashSync(hash, 10);
	}

	/**
	 * Count login attempts from IP
	 * @param gdpsid - GDPS ID
	 * @param req - Express request
	 * @returns Number of attempts
	 */
	public static async attemptsFromIP(gdpsid: string, req: Request): Promise<number> {
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
	 * @param gdpsid - GDPS ID
	 * @param req - Express request
	 * @returns True if too many attempts
	 */
	public static async tooManyAttemptsFromIP(gdpsid: string, req: Request): Promise<boolean> {
		return (await this.attemptsFromIP(gdpsid, req)) > 7;
	}

	/**
	 * Assign mod IPs to account
	 * @param gdpsid - GDPS ID
	 * @param accountID - Account ID
	 * @param ip - IP address
	 * @param req - Express request (optional)
	 */
	static async assignModIPs(gdpsid: string, accountID: number | string, ip: string, req?: Request): Promise<void> {
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
	 * @param gdpsid - GDPS ID
	 * @param accid - Account ID
	 * @param req - Express request
	 */
	public static async logInvalidAttemptFromIP(gdpsid: string, accid: number | string, req: Request): Promise<void> {
		const db = await threadConnection(gdpsid);
		const ip = await FixIp.getIP(req);
		const time = Math.floor(Date.now() / 1000);

		await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)", [accid, time, ip]);
	}

	/**
	 * Validate GJP2 hash against account ID
	 * @param gdpsid - GDPS ID
	 * @param accid - Account ID
	 * @param gjp2 - GJP2 hash
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	public static async isGJP2Valid(gdpsid: string, accid: number | string, gjp2: string, req: Request): Promise<number> {
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
	 * @param gdpsid - GDPS ID
	 * @param accid - Account ID
	 * @param pass - Password
	 * @param req - Express request (optional)
	 * @returns Database result
	 */
	public static async assignGJP2(gdpsid: string, accid: number | string, pass: string, req: Request = {} as Request): Promise<any> {
		const db = await threadConnection(gdpsid);
		const query = "UPDATE accounts SET gjp2 = ? WHERE accountID = ?";
		const gjp2 = await this.GJP2hash(gdpsid, pass, req);

		try {
			const [results] = await db.execute<ResultSetHeader>(query, [gjp2, accid]);
			return results;
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
			return "-1";
		}
	}

	/**
	 * Validate GJP2 hash against username
	 * @param gdpsid - GDPS ID
	 * @param userName - Username
	 * @param gjp2 - GJP2 hash
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	public static async isGJP2ValidUsrname(gdpsid: string, userName: string, gjp2: string, req: Request): Promise<number> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);

			if (rows.length === 0) {
				return 0;
			}

			const accID = rows[0].accountID;
			return await this.isGJP2Valid(gdpsid, accID, gjp2, req);
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
			return 0;
		}
	}

	/**
	 * Validate password against account ID
	 * @param gdpsid - GDPS ID
	 * @param accid - Account ID
	 * @param pass - Password
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	public static async isValid(gdpsid: string, accid: number | string, pass: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
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
			return 0;
		}
	}

	/**
	 * Validate password against username
	 * @param gdpsid - GDPS ID
	 * @param userName - Username
	 * @param pass - Password
	 * @param req - Express request
	 * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
	 */
	public static async isValidUsrname(gdpsid: string, userName: string, pass: string, req: Request): Promise<number> {
		const db = await threadConnection(gdpsid);
		const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);

		if (rows.length === 0) return 0;

		const accID = rows[0].accountID;
		return await this.isValid(gdpsid, accID, pass, req);
	}

	/**
	 * Process song reupload from Newgrounds
	 * @param gdpsid - GDPS ID
	 * @param result - Song data from API
	 * @returns Success status and song ID
	 */
	public static async songReupNG(gdpsid: string, result: string): Promise<string> {
		try {
			const db = await threadConnection(gdpsid);
			const resultarray = result.split("~|~");
			const uploadDate = Math.floor(Date.now() / 1000);

			// Check if song already exists
			const checkSong = async (resultarray: string[]): Promise<number> => {
				const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM songs WHERE download = ?", [resultarray[13]]);

				if (rows.length > 0) {
					return rows[0].ID;
				} else {
					return -1;
				}
			};

			if ((await checkSong(resultarray)) === -1) {
				const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download)
                         VALUES (?, ?, ?, ?, ?, ?)`;

				const [rows] = await db.execute<ResultSetHeader>(query, [
					null,
					resultarray[3],
					resultarray[5],
					resultarray[7],
					resultarray[9],
					resultarray[13]
				]);

				const lastID = rows.insertId.toString();
				return `Success:${lastID}`;
			} else {
				return `DublicateSongException:${await checkSong(resultarray)}`;
			}
		} catch (error) {
			return "UnknownSongException:0";
		}
	}

	/**
	 * Process song reupload from ZeMu
	 * @param gdpsid - GDPS ID
	 * @param result - Song data from API
	 * @returns Success status and song ID
	 */
	public static async songReupZM(gdpsid: string, result: string): Promise<string> {
		const db = await threadConnection(gdpsid);
		// Helper to check if song already exists
		const checkSong = async (resultarray: string[]): Promise<number> => {
			const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM songs WHERE download = ?", [resultarray[5]]);

			if (rows.length > 0) {
				return rows[0].ID;
			} else {
				return -1;
			}
		};

		try {
			if (result === "Error") {
				return "UnknownSongException:0";
			}

			const resultarray = result.split("~|~");

			if (resultarray[0] === "0") {
				return "UnverifiedSongException:0";
			}

			// Handle ZeMu song structure:
			// 0 - is verified
			// 1 - song name
			// 2 - author
			// 3 - author id
			// 4 - size
			// 5 - url
			const uploadDate = Math.floor(Date.now() / 1000);

			if ((await checkSong(resultarray)) === -1) {
				const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download)
                         VALUES (?, ?, ?, ?, ?, ?)`;

				const finalSongName = "[ZEMU] " + resultarray[1];

				const [rows] = await db.execute<ResultSetHeader>(query, [
					null,
					finalSongName,
					resultarray[3],
					resultarray[2],
					resultarray[4],
					resultarray[5]
				]);

				const lastID = rows.insertId.toString();
				return `Success:${lastID}`;
			} else {
				return `DublicateSongException:${await checkSong(resultarray)}`;
			}
		} catch (error) {
			return "UnknownSongException:0";
		}
	}

	/**
	 * Get level name by ID
	 * @param gdpsid - GDPS ID
	 * @param levelID - Level ID
	 * @returns Level name or "Unknown"
	 */
	public static async getLevelName(gdpsid: string, levelID: number | string): Promise<string> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.query<RowDataPacket[]>("SELECT levelName FROM levels WHERE levelID = ?", [levelID]);

			if (rows.length > 0) {
				return rows[0].levelName;
			} else {
				throw new Error(`Level ID ${levelID} not found`);
			}
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
			return "Unknown";
		}
	}

	/**
	 * Get map pack data by ID
	 * @param gdpsid - GDPS ID
	 * @param packID - Map pack ID
	 * @returns Map pack data
	 */
	public static async getMappackData(gdpsid: string, packID: number | string): Promise<MapPackData> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.query<RowDataPacket[]>("SELECT name, levels, stars, coins, difficulty, rgbcolors FROM mappacks WHERE ID = ?", [
				packID
			]);

			if (rows.length === 0) {
				return {
					packName: undefined,
					levels: undefined,
					stars: undefined,
					coins: undefined,
					difficulty: undefined,
					rgbcolors: undefined
				};
			}

			return {
				packName: rows[0].name,
				levels: rows[0].levels,
				stars: parseInt(rows[0].stars, 10),
				coins: parseInt(rows[0].coins, 10),
				difficulty: parseInt(rows[0].difficulty, 10),
				rgbcolors: rows[0].rgbcolors
			};
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
			return {
				packName: undefined,
				levels: undefined,
				stars: undefined,
				coins: undefined,
				difficulty: undefined,
				rgbcolors: undefined
			};
		}
	}

	/**
	 * Get gauntlet data by ID
	 * @param gdpsid - GDPS ID
	 * @param packID - Gauntlet ID
	 * @returns Gauntlet data
	 */
	public static async getGauntletData(gdpsid: string, packID: number | string): Promise<GauntletData> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.query<RowDataPacket[]>("SELECT level1, level2, level3, level4, level5 FROM gauntlets WHERE ID = ?", [packID]);

			if (rows.length === 0) {
				return {
					level1: undefined,
					level2: undefined,
					level3: undefined,
					level4: undefined,
					level5: undefined
				};
			}

			return {
				level1: parseInt(rows[0].level1, 10),
				level2: parseInt(rows[0].level2, 10),
				level3: parseInt(rows[0].level3, 10),
				level4: parseInt(rows[0].level4, 10),
				level5: parseInt(rows[0].level5, 10)
			};
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
			return {
				level1: undefined,
				level2: undefined,
				level3: undefined,
				level4: undefined,
				level5: undefined
			};
		}
	}

	/**
	 * Get username by account ID
	 * @param gdpsid - GDPS ID
	 * @param accountID - Account ID
	 * @returns Username or undefined
	 */
	public static async getUsernameByID(gdpsid: string, accountID: number | string): Promise<string | undefined> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.execute<RowDataPacket[]>("SELECT userName FROM accounts WHERE accountID = ?", [accountID]);

			if (rows.length > 0) {
				return rows[0].userName;
			} else {
				throw new Error(`Account with accountID "${accountID}" not found`);
			}
		} catch (error) {
			ConsoleApi.Error("main", `${error.message} at net.fimastgd.forevercore.panel.main`);
			return undefined;
		}
	}

	/**
	 * Get account ID by username
	 * @param gdpsid - GDPS ID
	 * @param userName - Username
	 * @returns Account ID or undefined
	 */
	public static async getIDbyUsername(gdpsid: string, userName: string): Promise<number> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE LOWER(userName) = LOWER(?)", [userName]);

			if (rows.length > 0) {
				return rows[0].accountID;
			} else {
				throw new Error(`Account with username "${userName}" not found`);
			}
		} catch (error) {
			ConsoleApi.Error("main", `${error.message} at net.fimastgd.forevercore.panel.main`);
			return -1;
		}
	}

	/**
	 * Check if account exists
	 * @param gdpsid - GDPS ID
	 * @param username - Username to check
	 * @returns True if account exists
	 */
	public static async checkAccountLegit(gdpsid: string, username: string): Promise<boolean> {
		try {
			const db = await threadConnection(gdpsid);
			const [rows] = await db.execute<RowDataPacket[]>("SELECT LOWER(userName) FROM accounts WHERE LOWER(userName) = ?", [
				username.toLowerCase()
			]);
			return rows.length > 0;
		} catch (error) {
			ConsoleApi.Error("main", `Error while checking account existence: ${error.message} at net.fimastgd.forevercore.panel.main`);
			return false;
		}
	}
}

export default Panel;
