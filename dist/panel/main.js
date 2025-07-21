'package net.fimastgd.forevercore.panel.main';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../serverconf/db"));
const apiLib_1 = __importDefault(require("../api/lib/apiLib"));
const fixIp_1 = __importDefault(require("../api/lib/fixIp"));
const console_api_1 = __importDefault(require("../modules/console-api"));
/**
 * Main panel functionality class
 */
class Panel {
    /**
     * Account management actions
     * @param action - Action to perform
     * @param username - Username to perform action on
     * @returns Account ID or undefined
     */
    static async account(action, username) {
        const db = await (0, db_1.default)('main');
        if (action === "activate") {
            const query = `
            UPDATE accounts 
            SET isActive = 1 
            WHERE LOWER(userName) = LOWER(?)
            AND isActive = 0
            `;
            await db.execute(query, [username]);
            return;
        }
        else if (action === "getID") {
            const [rows] = await db.query('SELECT accountID FROM accounts WHERE LOWER(userName) = LOWER(?)', [username]);
            const accountID = rows.length > 0 ? rows[0].accountID : null;
            return accountID;
        }
        else {
            throw new Error(`Incorrect value '${action}'!`);
        }
    }
    /**
     * Generate GJP2 hash from password
     * @param pass - Password to hash
     * @param req - Express request (optional)
     * @returns GJP2 hash
     */
    static GJP2fromPassword(pass, req = {}) {
        return crypto_1.default.createHash('sha1').update(pass + "mI29fmAnxgTs").digest('hex');
    }
    /**
     * Generate bcrypt hash from GJP2 hash
     * @param pass - Password to hash
     * @param req - Express request (optional)
     * @returns Bcrypt hash
     */
    static GJP2hash(pass, req = {}) {
        const hash = this.GJP2fromPassword(pass, req);
        return bcryptjs_1.default.hashSync(hash, 10);
    }
    /**
     * Count login attempts from IP
     * @param req - Express request
     * @returns Number of attempts
     */
    static async attemptsFromIP(req) {
        const db = await (0, db_1.default)('main');
        const ip = await fixIp_1.default.getIP(req);
        const newtime = Math.floor(Date.now() / 1000) - (60 * 60);
        const [rows] = await db.execute("SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?", [newtime, ip]);
        return rows[0].count;
    }
    /**
     * Check if IP has too many login attempts
     * @param req - Express request
     * @returns True if too many attempts
     */
    static async tooManyAttemptsFromIP(req) {
        return (await this.attemptsFromIP(req)) > 7;
    }
    /**
     * Assign mod IPs to account
     * @param accountID - Account ID
     * @param ip - IP address
     * @param req - Express request (optional)
     */
    static async assignModIPs(accountID, ip, req) {
        const db = await (0, db_1.default)('main');
        const modipCategory = await apiLib_1.default.getMaxValuePermission(accountID, "modipCategory");
        if (typeof modipCategory === 'number' && modipCategory > 0) {
            const [rows] = await db.execute("SELECT count(*) as count FROM modips WHERE accountID = ?", [accountID]);
            if (rows[0].count > 0) {
                await db.execute("UPDATE modips SET IP = ?, modipCategory = ? WHERE accountID = ?", [ip, modipCategory, accountID]);
            }
            else {
                await db.execute("INSERT INTO modips (IP, accountID, isMod, modipCategory) VALUES (?, ?, '1', ?)", [ip, accountID, modipCategory]);
            }
        }
    }
    /**
     * Log invalid login attempt from IP
     * @param accid - Account ID
     * @param req - Express request
     */
    static async logInvalidAttemptFromIP(accid, req) {
        const db = await (0, db_1.default)('main');
        const ip = await fixIp_1.default.getIP(req);
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
    static async isGJP2Valid(accid, gjp2, req) {
        const db = await (0, db_1.default)('main');
        if (await this.tooManyAttemptsFromIP(req)) {
            return -1;
        }
        const [rows] = await db.execute("SELECT gjp2, isActive FROM accounts WHERE accountID = ?", [accid]);
        if (rows.length === 0)
            return 0;
        const userInfo = rows[0];
        if (!userInfo.gjp2)
            return -2;
        const isPasswordValid = await bcryptjs_1.default.compare(gjp2, userInfo.gjp2);
        if (isPasswordValid) {
            await this.assignModIPs(accid, fixIp_1.default.getIP(req), req);
            return userInfo.isActive ? 1 : -2;
        }
        else {
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
    static async assignGJP2(accid, pass, req = {}) {
        const db = await (0, db_1.default)('main');
        const query = "UPDATE accounts SET gjp2 = ? WHERE accountID = ?";
        const gjp2 = await this.GJP2hash(pass, req);
        try {
            const [results] = await db.execute(query, [gjp2, accid]);
            return results;
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
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
    static async isGJP2ValidUsrname(userName, gjp2, req) {
        const db = await (0, db_1.default)('main');
        try {
            const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
            if (rows.length === 0) {
                return 0;
            }
            const accID = rows[0].accountID;
            return await this.isGJP2Valid(accID, gjp2, req);
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
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
    static async isValid(accid, pass, req) {
        const db = await (0, db_1.default)('main');
        const [rows] = await db.execute("SELECT accountID, salt, password, isActive, gjp2 FROM accounts WHERE accountID = ?", [accid]);
        if (rows.length === 0)
            return 0;
        const result = rows[0];
        const isPasswordValid = await bcryptjs_1.default.compare(pass, result.password);
        if (isPasswordValid) {
            if (!result.gjp2)
                await this.assignGJP2(accid, pass, req);
            await this.assignModIPs(accid, fixIp_1.default.getIP(req), req);
            return result.isActive ? 1 : -2;
        }
        else {
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
    static async isValidUsrname(userName, pass, req) {
        const db = await (0, db_1.default)('main');
        const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
        if (rows.length === 0)
            return 0;
        const accID = rows[0].accountID;
        return await this.isValid(accID, pass, req);
    }
    /**
     * Process song reupload from Newgrounds
     * @param result - Song data from API
     * @returns Success status and song ID
     */
    static async songReupNG(result) {
        const db = await (0, db_1.default)('main');
        try {
            const resultarray = result.split('~|~');
            const uploadDate = Math.floor(Date.now() / 1000);
            // Check if song already exists
            const checkSong = async (resultarray) => {
                const [rows] = await db.query('SELECT * FROM songs WHERE download = ?', [resultarray[13]]);
                if (rows.length > 0) {
                    return rows[0].ID;
                }
                else {
                    return -1;
                }
            };
            if (await checkSong(resultarray) === -1) {
                const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download)
                         VALUES (?, ?, ?, ?, ?, ?)`;
                const [rows] = await db.execute(query, [null, resultarray[3], resultarray[5], resultarray[7], resultarray[9], resultarray[13]]);
                const lastID = rows.insertId.toString();
                return `Success:${lastID}`;
            }
            else {
                return `DublicateSongException:${await checkSong(resultarray)}`;
            }
        }
        catch (error) {
            return "UnknownSongException:0";
        }
    }
    /**
     * Process song reupload from ZeMu
     * @param result - Song data from API
     * @returns Success status and song ID
     */
    static async songReupZM(result) {
        const db = await (0, db_1.default)('main');
        // Helper to check if song already exists
        const checkSong = async (resultarray) => {
            const [rows] = await db.query('SELECT * FROM songs WHERE download = ?', [resultarray[5]]);
            if (rows.length > 0) {
                return rows[0].ID;
            }
            else {
                return -1;
            }
        };
        try {
            if (result === "Error") {
                return "UnknownSongException:0";
            }
            const resultarray = result.split('~|~');
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
            if (await checkSong(resultarray) === -1) {
                const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download)
                         VALUES (?, ?, ?, ?, ?, ?)`;
                const finalSongName = "[ZEMU] " + resultarray[1];
                const [rows] = await db.execute(query, [null, finalSongName, resultarray[3], resultarray[2], resultarray[4], resultarray[5]]);
                const lastID = rows.insertId.toString();
                return `Success:${lastID}`;
            }
            else {
                return `DublicateSongException:${await checkSong(resultarray)}`;
            }
        }
        catch (error) {
            return "UnknownSongException:0";
        }
    }
    /**
     * Get level name by ID
     * @param levelID - Level ID
     * @returns Level name or "Unknown"
     */
    static async getLevelName(levelID) {
        const db = await (0, db_1.default)('main');
        try {
            const [rows] = await db.query("SELECT levelName FROM levels WHERE levelID = ?", [levelID]);
            if (rows.length > 0) {
                return rows[0].levelName;
            }
            else {
                throw new Error(`Level ID ${levelID} not found`);
            }
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
            return "Unknown";
        }
    }
    /**
     * Get map pack data by ID
     * @param packID - Map pack ID
     * @returns Map pack data
     */
    static async getMappackData(packID) {
        const db = await (0, db_1.default)('main');
        try {
            const [rows] = await db.query("SELECT name, levels, stars, coins, difficulty, rgbcolors FROM mappacks WHERE ID = ?", [packID]);
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
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
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
     * @param packID - Gauntlet ID
     * @returns Gauntlet data
     */
    static async getGauntletData(packID) {
        try {
            const db = await (0, db_1.default)('main');
            const [rows] = await db.query("SELECT level1, level2, level3, level4, level5 FROM gauntlets WHERE ID = ?", [packID]);
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
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.main`);
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
     * @param accountID - Account ID
     * @returns Username or undefined
     */
    static async getUsernameByID(accountID) {
        try {
            const db = await (0, db_1.default)('main');
            const [rows] = await db.execute('SELECT userName FROM accounts WHERE accountID = ?', [accountID]);
            if (rows.length > 0) {
                return rows[0].userName;
            }
            else {
                throw new Error(`Account with accountID "${accountID}" not found`);
            }
        }
        catch (error) {
            console_api_1.default.Error('main', `${error.message} at net.fimastgd.forevercore.panel.main`);
            return undefined;
        }
    }
    /**
     * Get account ID by username
     * @param userName - Username
     * @returns Account ID or undefined
     */
    static async getIDbyUsername(userName) {
        try {
            const db = await (0, db_1.default)('main');
            const [rows] = await db.execute('SELECT accountID FROM accounts WHERE LOWER(userName) = LOWER(?)', [userName]);
            if (rows.length > 0) {
                return rows[0].accountID;
            }
            else {
                throw new Error(`Account with username "${userName}" not found`);
            }
        }
        catch (error) {
            console_api_1.default.Error('main', `${error.message} at net.fimastgd.forevercore.panel.main`);
            return undefined;
        }
    }
    /**
     * Check if account exists
     * @param username - Username to check
     * @returns True if account exists
     */
    static async checkAccountLegit(username) {
        try {
            const db = await (0, db_1.default)('main');
            const [rows] = await db.execute('SELECT LOWER(userName) FROM accounts WHERE LOWER(userName) = ?', [username.toLowerCase()]);
            return rows.length > 0;
        }
        catch (error) {
            console_api_1.default.Error("main", `Error while checking account existence: ${error.message} at net.fimastgd.forevercore.panel.main`);
            return false;
        }
    }
}
exports.default = Panel;
