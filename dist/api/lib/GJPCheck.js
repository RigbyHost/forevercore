'package net.fimastgd.forevercore.api.lib.GJPCheck';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const XORCipher_1 = __importDefault(require("./XORCipher"));
const apiLib_1 = __importDefault(require("./apiLib"));
const settings_1 = require("../../serverconf/settings");
const exploitPatch_1 = __importDefault(require("./exploitPatch"));
const fixIp_1 = __importDefault(require("./fixIp"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
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
    static async check(gjp, accountID, req) {
        // Check session grants to bypass auth
        if (settings_1.settings.sessionGrants) {
            const ip = await fixIp_1.default.getIP(req);
            const [rows] = await db_proxy_1.default.execute("SELECT count(*) as count FROM actions WHERE type = 16 AND value = ? AND value2 = ? AND timestamp > ?", [accountID, ip, Math.floor(Date.now() / 1000) - 3600]);
            if (rows[0].count > 0) {
                return 1;
            }
        }
        // Decode GJP
        let gjpdecode = gjp.replace(/_/g, "/").replace(/-/g, "+");
        gjpdecode = Buffer.from(gjpdecode, "base64").toString("binary");
        gjpdecode = await XORCipher_1.default.cipher(gjpdecode, 37526);
        // Validate credentials
        const validationResult = await this.isValid(accountID, gjpdecode, req);
        // Store session grant if enabled and auth successful
        if (validationResult === 1 && settings_1.settings.sessionGrants) {
            const ip = await fixIp_1.default.getIP(req);
            await db_proxy_1.default.execute("INSERT INTO actions (type, value, value2, timestamp) VALUES (16, ?, ?, ?)", [accountID, ip, Math.floor(Date.now() / 1000)]);
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
    static async validateGJPOrDie(gjp, accountID, req) {
        const result = await this.check(gjp, accountID, req);
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
    static async validateGJP2OrDie(gjp2, accountID, req) {
        const result = await this.isGJP2Valid(accountID, gjp2, req);
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
    static async getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req) {
        if (!accountIDStr) {
            return "-1";
        }
        const accountID = await exploitPatch_1.default.remove(accountIDStr);
        if (gjpStr) {
            await this.validateGJPOrDie(gjpStr, accountID, req);
        }
        else if (gjp2Str) {
            await this.validateGJP2OrDie(gjp2Str, accountID, req);
        }
        else {
            return "-1";
        }
        return accountID;
    }
    // GeneratePass functionality to avoid circular dependency
    /**
     * Generate GJP2 hash from password
     * @param pass - Password to hash
     * @param req - Express request (optional)
     * @returns GJP2 hash
     */
    static async GJP2fromPassword(pass, req = {}) {
        return crypto_1.default.createHash('sha1').update(pass + "mI29fmAnxgTs").digest('hex');
    }
    /**
     * Generate bcrypt hash from GJP2 hash
     * @param pass - Password to hash
     * @param req - Express request (optional)
     * @returns Bcrypt hash
     */
    static async GJP2hash(pass, req = {}) {
        const hash = await this.GJP2fromPassword(pass, req);
        return bcryptjs_1.default.hashSync(hash, 10);
    }
    /**
     * Count login attempts from IP
     * @param req - Express request
     * @returns Number of attempts
     */
    static async attemptsFromIP(req) {
        const ip = await fixIp_1.default.getIP(req);
        const newtime = Math.floor(Date.now() / 1000) - (60 * 60);
        const [rows] = await db_proxy_1.default.execute("SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?", [newtime, ip]);
        return rows[0].count;
    }
    /**
     * Check if IP has too many login attempts
     * @param req - Express request
     * @returns True if too many attempts
     */
    static async tooManyAttemptsFromIP(req) {
        return await this.attemptsFromIP(req) > 7;
    }
    /**
     * Assign mod IPs to account
     * @param accountID - Account ID
     * @param ip - IP address
     * @param req - Express request (optional)
     */
    static async assignModIPs(accountID, ip, req) {
        const modipCategory = await apiLib_1.default.getMaxValuePermission(accountID, "modipCategory");
        if (typeof modipCategory === 'number' && modipCategory > 0) {
            const [rows] = await db_proxy_1.default.execute("SELECT count(*) as count FROM modips WHERE accountID = ?", [accountID]);
            if (rows[0].count > 0) {
                await db_proxy_1.default.execute("UPDATE modips SET IP = ?, modipCategory = ? WHERE accountID = ?", [ip, modipCategory, accountID]);
            }
            else {
                await db_proxy_1.default.execute("INSERT INTO modips (IP, accountID, isMod, modipCategory) VALUES (?, ?, '1', ?)", [ip, accountID, modipCategory]);
            }
        }
    }
    /**
     * Log invalid login attempt from IP
     * @param accid - Account ID
     * @param req - Express request
     */
    static async logInvalidAttemptFromIP(accid, req) {
        const ip = await fixIp_1.default.getIP(req);
        const time = Math.floor(Date.now() / 1000);
        await db_proxy_1.default.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)", [accid, time, ip]);
    }
    /**
     * Validate GJP2 hash against account ID
     * @param accid - Account ID
     * @param gjp2 - GJP2 hash
     * @param req - Express request
     * @returns 1 if valid, 0 if invalid, -1 if too many attempts, -2 if account inactive
     */
    static async isGJP2Valid(accid, gjp2, req) {
        if (await this.tooManyAttemptsFromIP(req)) {
            return -1;
        }
        const [rows] = await db_proxy_1.default.execute("SELECT gjp2, isActive FROM accounts WHERE accountID = ?", [accid]);
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
    static async assignGJP2(accid, pass, req) {
        const gjp2 = await this.GJP2hash(pass, req);
        try {
            const [results] = await db_proxy_1.default.execute("UPDATE accounts SET gjp2 = ? WHERE accountID = ?", [gjp2, accid]);
            return results;
        }
        catch (error) {
            console_api_1.default.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
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
    static async isGJP2ValidUsrname(userName, gjp2, req) {
        try {
            const [rows] = await db_proxy_1.default.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
            if (rows.length === 0) {
                return 0;
            }
            const accID = rows[0].accountID;
            return await this.isGJP2Valid(accID, gjp2, req);
        }
        catch (error) {
            console_api_1.default.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
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
        if (await this.tooManyAttemptsFromIP(req))
            return -1;
        const [rows] = await db_proxy_1.default.execute("SELECT accountID, salt, password, isActive, gjp2 FROM accounts WHERE accountID = ?", [accid]);
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
    static async isValidUsrname(userName, pass, req) {
        const [rows] = await db_proxy_1.default.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
        if (rows.length === 0)
            return 0;
        const accID = rows[0].accountID;
        return await this.isValid(accID, pass, req);
    }
}
exports.default = GJPCheck;
