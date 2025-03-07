'package net.fimastgd.forevercore.api.lib.apiLib';

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from './exploitPatch';
import { settings } from '../../serverconf/settings';
import XORCipher from './XORCipher';
import FixIp from './fixIp';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ConsoleApi from '../../modules/console-api';
import { Numbers } from '../../modules/numbers';
import { Request } from 'express';

const is = new Numbers();

/**
 * Main API library for common server functions
 */
class ApiLib {
    /**
     * Gets client IP address from request
     * @param req - Express request object
     * @returns Client IP address
     */
    static getIP(req: Request): string {
        if (!req || !req.headers) {
            ConsoleApi.Error("main", "ERROR WITH IP() HEADERS!!! UNDEFINED!");
            return "ERROR WITH IP() HEADERS!!!";
        }
        const forwarded = req.headers["x-forwarded-for"] as string | undefined;
        return forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress || '';
    }

    /**
     * Checks if a value is numeric
     * @param value - Value to check
     * @returns True if numeric
     */
    static isNumeric(value: any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Gets the maximum value of a permission for an account
     * @param accountID - Account ID to check
     * @param permission - Permission to check
     * @returns Permission value or false if error
     */
    static async getMaxValuePermission(accountID: number | string, permission: string): Promise<number | boolean> {
        if (isNaN(Number(accountID))) return false;

        let maxValue = 0;
        try {
            const [roleIDarray] = await db.execute<RowDataPacket[]>(
                "SELECT roleID FROM roleassign WHERE accountID = ?",
                [accountID]
            );

            if (roleIDarray.length === 0) return maxValue;

            const roleIDlist = roleIDarray.map(row => row.roleID).join(",");

            const [roles] = await db.execute<RowDataPacket[]>(
                `SELECT ${permission} FROM roles WHERE roleID IN (${roleIDlist}) ORDER BY priority DESC`
            );

            roles.forEach(role => {
                if (role[permission] > maxValue) {
                    maxValue = role[permission];
                }
            });

            return maxValue;
        } catch (error) {
            ConsoleApi.Error("main", `Error fetching permission data: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }

    /**
     * Gets account ID from request parameters
     * @param udidStr - UDID string
     * @param gameVersionStr - Game version
     * @param accountIDStr - Account ID
     * @param gjp2Str - GJP2 hash
     * @param gjpStr - GJP hash
     * @param req - Express request
     * @returns Account ID or "-1" on failure
     */
    static async getIDFromPost(
        udidStr?: string,
        gameVersionStr?: string,
        accountIDStr?: string,
        gjp2Str?: string,
        gjpStr?: string,
        req?: Request
    ): Promise<string> {
        try {
            if (gjpStr) {
                if (udidStr && gameVersionStr && parseInt(gameVersionStr) < 20 && settings.unregisteredSubmissions) {
                    const id = await ExploitPatch.remove(udidStr);
                    if (this.isNumeric(id)) {
                        return "-1";
                    }
                    return id;
                } else if (accountIDStr && accountIDStr !== "0") {
                    const id = await this.getAccountIDOrDie(accountIDStr, undefined, gjpStr, req);
                    return id;
                } else {
                    return "-1";
                }
            } else if (gjp2Str) {
                if (udidStr && gameVersionStr && parseInt(gameVersionStr) < 20 && settings.unregisteredSubmissions) {
                    const id = await ExploitPatch.remove(udidStr);
                    if (this.isNumeric(id)) {
                        return "-1";
                    }
                    return id;
                } else if (accountIDStr && accountIDStr !== "0") {
                    const id = await this.getAccountIDOrDie(accountIDStr, gjp2Str, undefined, req);
                    return id;
                } else {
                    return "-1";
                }
            }
            return "-1";
        } catch (error) {
            ConsoleApi.Error("main", `getIDFromPostException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }

    /**
     * Gets or creates a user ID for an account
     * @param extID - External ID (account ID)
     * @param userName - Username
     * @returns User ID
     */
    static async getUserID(extID: string | number, userName: string = "Undefined"): Promise<number | string> {
        try {
            const register = this.isNumeric(extID) ? 1 : 0;
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT userID FROM users WHERE extID = ?",
                [extID]
            );

            if (rows.length > 0) {
                return rows[0].userID;
            } else {
                const time = Math.floor(Date.now() / 1000);
                const [result] = await db.execute<ResultSetHeader>(
                    "INSERT INTO users (isRegistered, extID, userName, lastPlayed) VALUES (?, ?, ?, ?)",
                    [register, extID, userName, time]
                );
                return result.insertId;
            }
        } catch (error) {
            ConsoleApi.Error("main", `getUserIDException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }

    /**
     * Checks if a user has a specific permission
     * @param accountID - Account ID
     * @param permission - Permission to check
     * @returns True if has permission
     */
    static async checkPermission(accountID: number | string, permission: string): Promise<boolean> {
        try {
            // Check if admin
            const [adminRows] = await db.execute<RowDataPacket[]>(
                "SELECT isAdmin FROM accounts WHERE accountID = ?",
                [accountID]
            );

            if (adminRows.length > 0 && adminRows[0].isAdmin === 1) {
                return true;
            }

            // Check role permissions
            const [roleRows] = await db.execute<RowDataPacket[]>(
                "SELECT roleID FROM roleassign WHERE accountID = ?",
                [accountID]
            );

            if (roleRows.length > 0) {
                const roleIDs = roleRows.map(row => row.roleID).join(",");

                const [permRows] = await db.execute<RowDataPacket[]>(
                    `SELECT ${permission} FROM roles WHERE roleID IN (${roleIDs}) ORDER BY priority DESC`
                );

                for (const role of permRows) {
                    if (role[permission] === 1) return true;
                    if (role[permission] === 2) return false;
                }
            }

            // Check default permission
            const [defaultRows] = await db.execute<RowDataPacket[]>(
                `SELECT ${permission} FROM roles WHERE isDefault = 1`
            );

            if (defaultRows.length > 0) {
                return defaultRows[0][permission] === 1;
            }

            return false;
        } catch (error) {
            ConsoleApi.Error("main", `checkPermissionException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }

    /**
     * Gets a list of friends for an account
     * @param accountID - Account ID
     * @returns Array of friend account IDs
     */
    static async getFriends(accountID: number | string): Promise<number[]> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT person1, person2 FROM friendships WHERE person1 = ? OR person2 = ?",
                [accountID, accountID]
            );

            if (rows.length === 0) return [];

            return rows.map(row => {
                return row.person1 == accountID ? row.person2 : row.person1;
            });
        } catch (error) {
            ConsoleApi.Error("main", `getFriendsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return [];
        }
    }

    /**
     * Gets the list levels for a list ID
     * @param listID - List ID
     * @returns Comma-separated list of level IDs
     */
    static async getListLevels(listID: number | string): Promise<string | null> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT listlevels FROM lists WHERE listID = ?",
                [listID]
            );

            return rows.length > 0 ? rows[0].listlevels : null;
        } catch (error) {
            ConsoleApi.Error("main", `getListLevelsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return null;
        }
    }

    /**
     * Checks if two users are friends
     * @param accountID - First account ID
     * @param targetAccountID - Second account ID
     * @returns True if friends
     */
    static async isFriends(accountID: number | string, targetAccountID: number | string): Promise<boolean> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT COUNT(*) as count FROM friendships WHERE (person1 = ? AND person2 = ?) OR (person1 = ? AND person2 = ?)",
                [accountID, targetAccountID, targetAccountID, accountID]
            );

            return rows[0].count > 0;
        } catch (error) {
            ConsoleApi.Error("main", `isFriendsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }

    /**
     * Formats song data as a string
     * @param song - Song data object
     * @returns Formatted song string
     */
    static getSongString(song: any): string | false {
        if (song.ID == 0 || !song.ID) {
            return false;
        }

        if (song.isDisabled == 1) {
            return false;
        }

        let dl = song.download;
        if (dl.includes(":")) {
            dl = encodeURIComponent(dl);
        }

        return `1~|~${song.ID}~|~2~|~${song.name.replace(/#/g, "")}~|~3~|~${song.authorID}~|~4~|~${song.authorName}~|~5~|~${song.size}~|~6~|~~|~10~|~${dl}~|~7~|~~|~8~|~1`;
    }

    /**
     * Formats user data as a string
     * @param userdata - User data object
     * @returns Formatted user string
     */
    static getUserString(userdata: any): string {
        const extID = Number.isInteger(parseInt(userdata.extID)) ? userdata.extID : 0;
        return `${userdata.userID}:${userdata.userName}:${extID}`;
    }

    /**
     * Gets the difficulty data from star count
     * @param stars - Star count
     * @returns Difficulty object
     */
    static async getDiffFromStars(stars: number | string): Promise<{
        diff: number,
        auto: number,
        demon: number,
        name: string
    }> {
        try {
            let auto = 0;
            let demon = 0;
            let diffname: string;
            let diff: number;
            const starsInt = parseInt(stars.toString());

            switch (starsInt) {
                case 1:
                    diffname = "Auto";
                    diff = 50;
                    auto = 1;
                    break;
                case 2:
                    diffname = "Easy";
                    diff = 10;
                    break;
                case 3:
                    diffname = "Normal";
                    diff = 20;
                    break;
                case 4:
                case 5:
                    diffname = "Hard";
                    diff = 30;
                    break;
                case 6:
                case 7:
                    diffname = "Harder";
                    diff = 40;
                    break;
                case 8:
                case 9:
                    diffname = "Insane";
                    diff = 50;
                    break;
                case 10:
                    diffname = "Demon";
                    diff = 50;
                    demon = 1;
                    break;
                default:
                    diffname = "N/A: " + stars;
                    diff = 0;
                    demon = 0;
                    break;
            }

            return { diff, auto, demon, name: diffname };
        } catch (error) {
            ConsoleApi.Error("main", `getDiffFromStarsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return { diff: 0, auto: 0, demon: 0, name: "Error" };
        }
    }

    /**
     * Sets star rating for a level
     * @param accountID - Mod account ID
     * @param levelID - Level ID
     * @param stars - Star count
     * @param difficulty - Difficulty value
     * @param auto - Auto flag
     * @param demon - Demon flag
     */
    static async rateLevel(
        accountID: number | string,
        levelID: number | string,
        stars: number,
        difficulty: number,
        auto: number,
        demon: number
    ): Promise<void> {
        try {
            const timestamp = Math.floor(Date.now() / 1000);

            await db.execute(
                "UPDATE levels SET starDemon=?, starAuto=?, starDifficulty=?, starStars=?, rateDate=? WHERE levelID=?",
                [demon, auto, difficulty, stars, timestamp, levelID]
            );

            const diffName = await this.getDiffFromStars(stars);

            await db.execute(
                "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (?, ?, ?, ?, ?, ?)",
                ['1', diffName.name, timestamp, stars, levelID, accountID]
            );
        } catch (error) {
            ConsoleApi.Error("main", `rateLevelException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
        }
    }

    /**
     * Gets the list owner for a list ID
     * @param listID - List ID
     * @returns Account ID of list owner
     */
    static async getListOwner(listID: number | string): Promise<number | null> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT accountID FROM lists WHERE listID = ?",
                [listID]
            );

            return rows.length > 0 ? rows[0].accountID : null;
        } catch (error) {
            ConsoleApi.Error("main", `getListOwnerException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return null;
        }
    }

    /**
     * Gets account ID from username
     * @param userName - Username
     * @returns Account ID
     */
    static async getAccountIDFromName(userName: string): Promise<number> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT accountID FROM accounts WHERE userName LIKE ?",
                [userName]
            );

            return rows.length > 0 ? rows[0].accountID : 0;
        } catch (error) {
            ConsoleApi.Error("main", `getAccountIDFromNameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return 0;
        }
    }

    /**
     * Gets list name for a list ID
     * @param listID - List ID
     * @returns List name
     */
    static async getListName(listID: number | string): Promise<string | null> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT listName FROM lists WHERE listID = ?",
                [listID]
            );

            return rows.length > 0 ? rows[0].listName : null;
        } catch (error) {
            ConsoleApi.Error("main", `getListNameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return null;
        }
    }

    /**
     * Gets account comment color for an account
     * @param accountID - Account ID
     * @returns Color string
     */
    static async getAccountCommentColor(accountID: number | string): Promise<string> {
        try {
            if (await !is.Int(accountID)) return "255,255,255";

            const [roleRows] = await db.execute<RowDataPacket[]>(
                "SELECT roleID FROM roleassign WHERE accountID = ?",
                [accountID]
            );

            if (roleRows.length > 0) {
                const roleIDs = roleRows.map(row => row.roleID).join(",");

                const [colorRows] = await db.execute<RowDataPacket[]>(
                    `SELECT commentColor FROM roles WHERE roleID IN (${roleIDs}) ORDER BY priority DESC`
                );

                for (const role of colorRows) {
                    if (role.commentColor !== "000,000,000") {
                        return role.commentColor;
                    }
                }
            }

            const [defaultRows] = await db.execute<RowDataPacket[]>(
                "SELECT commentColor FROM roles WHERE isDefault = 1"
            );

            if (defaultRows.length > 0) {
                return defaultRows[0].commentColor;
            }

            return "255,255,255";
        } catch (error) {
            ConsoleApi.Error("main", `getAccountCommentColorException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "255,255,255";
        }
    }

    /**
     * Gets difficulty values from difficulty name
     * @param nameStr - Difficulty name
     * @returns Array of [difficulty, demon, auto]
     */
    static async getDiffFromName(nameStr: string): Promise<[number, number, number]> {
        const name = nameStr.toLowerCase();
        let starAuto = 0;
        let starDemon = 0;
        let starDifficulty: number;

        switch (name) {
            case "easy":
                starDifficulty = 10;
                break;
            case "normal":
                starDifficulty = 20;
                break;
            case "hard":
                starDifficulty = 30;
                break;
            case "harder":
                starDifficulty = 40;
                break;
            case "insane":
                starDifficulty = 50;
                break;
            case "auto":
                starDifficulty = 50;
                starAuto = 1;
                break;
            case "demon":
                starDifficulty = 50;
                starDemon = 1;
                break;
            default:
                starDifficulty = 0;
                break;
        }

        return [starDifficulty, starDemon, starAuto];
    }

    /**
     * Suggests a level for rating
     * @param accountID - Account ID
     * @param levelID - Level ID
     * @param difficulty - Difficulty value
     * @param stars - Star count
     * @param feat - Feature value
     * @param auto - Auto flag
     * @param demon - Demon flag
     */
    static async suggestLevel(
        accountID: number | string,
        levelID: number | string,
        difficulty: number,
        stars: number | string,
        feat: number | string,
        auto: number,
        demon: number
    ): Promise<void> {
        try {
            await db.execute(
                "INSERT INTO suggest (suggestBy, suggestLevelID, suggestDifficulty, suggestStars, suggestFeatured, suggestAuto, suggestDemon, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [accountID, levelID, difficulty, stars, feat, auto, demon, Math.floor(Date.now() / 1000)]
            );
        } catch (error) {
            ConsoleApi.Error("main", `suggestLevelException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
        }
    }

    /**
     * Verifies coins for a level
     * @param accountID - Account ID
     * @param levelID - Level ID
     * @param coins - Coins value
     */
    static async verifyCoinsLevel(
        accountID: number | string,
        levelID: number | string,
        coins: number
    ): Promise<void> {
        try {
            await db.execute(
                "UPDATE levels SET starCoins=? WHERE levelID=?",
                [coins, levelID]
            );

            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                ['3', coins, levelID, Math.floor(Date.now() / 1000), accountID]
            );
        } catch (error) {
            ConsoleApi.Error("main", `verifyCoinsLevelException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
        }
    }

    /**
     * Sets featured status for a level
     * @param accountID - Account ID
     * @param levelID - Level ID
     * @param state - Feature state (0-4)
     */
    static async featureLevel(
        accountID: number | string,
        levelID: number | string,
        state: number | string
    ): Promise<void> {
        try {
            let feature = 0;
            let epic = 0;

            switch (parseInt(state.toString())) {
                case 0:
                    feature = 0;
                    epic = 0;
                    break;
                case 1:
                    feature = 1;
                    epic = 0;
                    break;
                case 2:
                    feature = 1;
                    epic = 1;
                    break;
                case 3:
                    feature = 1;
                    epic = 2;
                    break;
                case 4:
                    feature = 1;
                    epic = 3;
                    break;
            }

            await db.execute(
                "UPDATE levels SET starFeatured=?, starEpic=?, rateDate=? WHERE levelID=?",
                [feature, epic, Math.floor(Date.now() / 1000), levelID]
            );

            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                ['2', state, levelID, Math.floor(Date.now() / 1000), accountID]
            );
        } catch (error) {
            ConsoleApi.Error("main", `featureLevelException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
        }
    }

    /**
     * Gets account name from account ID
     * @param accountID - Account ID
     * @returns Username or false if not found
     */
    static async getAccountName(accountID: number | string): Promise<string | false> {
        try {
            if (isNaN(Number(accountID))) return false;

            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT userName FROM accounts WHERE accountID = ?",
                [accountID]
            );

            return rows.length > 0 ? rows[0].userName : false;
        } catch (error) {
            ConsoleApi.Error("main", `getAccountNameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }

    /**
     * Gets difficulty name from difficulty values
     * @param diff - Difficulty value
     * @param auto - Auto flag
     * @param demon - Demon flag
     * @returns Difficulty name
     */
    static async getDifficulty(diff: number, auto: number, demon: number): Promise<string> {
        if (auto !== 0) {
            return "Auto";
        } else if (demon !== 0) {
            return "Demon";
        } else {
            switch (diff) {
                case 0:
                    return "N/A";
                case 10:
                    return "Easy";
                case 20:
                    return "Normal";
                case 30:
                    return "Hard";
                case 40:
                    return "Harder";
                case 50:
                    return "Insane";
                default:
                    return "Unknown";
            }
        }
    }

    // GJP Check methods
    /**
     * Checks GJP hash against account ID
     */
    static async check(gjp: string, accountID: number | string, req?: Request): Promise<number> {
        if (settings.sessionGrants) {
            const ip = FixIp.getIP(req);
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT count(*) as count FROM actions WHERE type = 16 AND value = ? AND value2 = ? AND timestamp > ?",
                [accountID, ip, Math.floor(Date.now() / 1000) - 3600]
            );

            if (rows[0].count > 0) {
                return 1;
            }
        }

        let gjpdecode = gjp.replace(/_/g, "/").replace(/-/g, "+");
        gjpdecode = Buffer.from(gjpdecode, "base64").toString("binary");
        gjpdecode = await XORCipher.cipher(gjpdecode, 37526);

        const validationResult = await this.isValid(accountID, gjpdecode, req);

        if (validationResult === 1 && settings.sessionGrants && req) {
            const ip = await FixIp.getIP(req);
            await db.execute(
                "INSERT INTO actions (type, value, value2, timestamp) VALUES (16, ?, ?, ?)",
                [accountID, ip, Math.floor(Date.now() / 1000)]
            );
        }

        return validationResult;
    }

    /**
     * Validates GJP hash or returns error
     */
    static async validateGJPOrDie(gjp: string, accountID: number | string, req?: Request): Promise<string | void> {
        const result = await this.check(gjp, accountID, req);
        if (result !== 1) {
            return "-1";
        }
    }

    /**
     * Validates GJP2 hash or returns error
     */
    static async validateGJP2OrDie(gjp2: string, accountID: number | string, req?: Request): Promise<string | void> {
        const result = await this.isGJP2Valid(accountID, gjp2, req);
        if (result !== 1) {
            return "-1";
        }
    }

    /**
     * Gets account ID from request or returns error
     */
    static async getAccountIDOrDie(
        accountIDStr?: string,
        gjp2Str?: string,
        gjpStr?: string,
        req?: Request
    ): Promise<string> {
        if (!accountIDStr) {
            return "-1";
        }

        const accountID = ExploitPatch.remove(accountIDStr);

        if (gjpStr) {
            await this.validateGJPOrDie(gjpStr, accountID, req);
        } else if (gjp2Str) {
            await this.validateGJP2OrDie(gjp2Str, accountID, req);
        } else {
            return "-1";
        }

        return accountID;
    }

    /**
     * Creates GJP2 hash from password
     */
    static async GJP2fromPassword(pass: string, req: Request = {} as Request): Promise<string> {
        return crypto
            .createHash("sha1")
            .update(pass + "mI29fmAnxgTs")
            .digest("hex");
    }

    /**
     * Creates bcrypt hash from GJP2 hash
     */
    static async GJP2hash(pass: string, req: Request = {} as Request): Promise<string> {
        const hash = await this.GJP2fromPassword(pass, req);
        return bcrypt.hashSync(hash, 10);
    }

    /**
     * Counts login attempts from IP address
     */
    static async attemptsFromIP(req?: Request): Promise<number> {
        if (!req) return 0;

        const ip = await FixIp.getIP(req);
        const newtime = Math.floor(Date.now() / 1000) - (60 * 60);

        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?",
            [newtime, ip]
        );

        return rows[0].count;
    }

    /**
     * Checks if IP has too many login attempts
     */
    static async tooManyAttemptsFromIP(req?: Request): Promise<boolean> {
        return (await this.attemptsFromIP(req)) > 7;
    }

    /**
     * Assigns mod IP permissions to account
     */
    static async assignModIPs(accountID: number | string, ip: string, req?: Request): Promise<void> {
        const modipCategory = await ApiLib.getMaxValuePermission(accountID, "modipCategory");

        if (modipCategory && typeof modipCategory === 'number' && modipCategory > 0) {
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
     * Logs invalid login attempt from IP
     */
    static async logInvalidAttemptFromIP(accid: number | string, req?: Request): Promise<void> {
        if (!req) return;

        const ip = await FixIp.getIP(req);
        const time = Math.floor(Date.now() / 1000);

        await db.execute(
            "INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)",
            [accid, time, ip]
        );
    }

    /**
     * Validates GJP2 hash against account ID
     */
    static async isGJP2Valid(accid: number | string, gjp2: string, req?: Request): Promise<number> {
        if (await this.tooManyAttemptsFromIP(req)) {
            return -1;
        }

        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT gjp2, isActive FROM accounts WHERE accountID = ?",
            [accid]
        );

        if (rows.length === 0) return 0;

        const userInfo = rows[0];
        if (!userInfo.gjp2) return -2;

        const isPasswordValid = await bcrypt.compare(gjp2, userInfo.gjp2);

        if (isPasswordValid) {
            if (req) await this.assignModIPs(accid, FixIp.getIP(req), req);
            return userInfo.isActive ? 1 : -2;
        } else {
            if (req) await this.logInvalidAttemptFromIP(accid, req);
            return 0;
        }
    }

    /**
     * Assigns GJP2 hash to account
     */
    static async assignGJP2(accid: number | string, pass: string, req?: Request): Promise<any> {
        const gjp2 = await this.GJP2hash(pass, req);

        try {
            const [results] = await db.execute(
                "UPDATE accounts SET gjp2 = ? WHERE accountID = ?",
                [gjp2, accid]
            );

            return results;
        } catch (error) {
            ConsoleApi.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }

    /**
     * Validates GJP2 hash against username
     */
    static async isGJP2ValidUsrname(userName: string, gjp2: string, req?: Request): Promise<number> {
        try {
            const [rows] = await db.execute<RowDataPacket[]>(
                "SELECT accountID FROM accounts WHERE userName LIKE ?",
                [userName]
            );

            if (rows.length === 0) {
                return 0;
            }

            const accID = rows[0].accountID;
            return await this.isGJP2Valid(accID, gjp2, req);
        } catch (error) {
            ConsoleApi.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return 0;
        }
    }

    /**
     * Validates password against account ID
     */
    static async isValid(accid: number | string, pass: string, req?: Request): Promise<number> {
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
            if (req) await this.assignModIPs(accid, FixIp.getIP(req), req);
            return result.isActive ? 1 : -2;
        } else {
            if (req) await this.logInvalidAttemptFromIP(accid, req);
            return 0;
        }
    }

    /**
     * Validates password against username
     */
    static async isValidUsrname(userName: string, pass: string, req?: Request): Promise<number> {
        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT accountID FROM accounts WHERE userName LIKE ?",
            [userName]
        );

        if (rows.length === 0) return 0;

        const accID = rows[0].accountID;
        return await this.isValid(accID, pass, req);
    }
}

export default ApiLib;