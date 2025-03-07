'package net.fimastgd.forevercore.api.lib.GJPCheck';

const db = require("../../serverconf/db");
const XORCipher = require("./XORCipher");
const ApiLib = require("./apiLib");
const settings = require("../../serverconf/settings");
const ExploitPatch = require("./exploitPatch");
const FixIp = require("./fixIp");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const ConsoleApi = require("../../modules/console-api");

class GJPCheck {
    static async check(gjp, accountID, req) {
        if (settings.sessionGrants) {
            const ip = FixIp.getIP(req);
            const [rows] = await db.execute("SELECT count(*) as count FROM actions WHERE type = 16 AND value = ? AND value2 = ? AND timestamp > ?", [accountID, ip, Math.floor(Date.now() / 1000) - 3600]);
            if (rows[0].count > 0) {
                return 1;
            }
        }
        let gjpdecode = gjp.replace(/_/g, "/").replace(/-/g, "+");
        gjpdecode = Buffer.from(gjpdecode, "base64").toString("binary");
        gjpdecode = await XORCipher.cipher(gjpdecode, 37526);
        const validationResult = await this.isValid(accountID, gjpdecode, req);
        if (validationResult === 1 && settings.sessionGrants) {
            const ip = await FixIp.getIP(req);
            await db.execute("INSERT INTO actions (type, value, value2, timestamp) VALUES (16, ?, ?, ?)", [accountID, ip, Math.floor(Date.now() / 1000)]);
        }
        return validationResult;
    }
   
    static async validateGJPOrDie(gjp, accountID, req) {
        const result = await this.check(gjp, accountID, req);
        if (result !== 1) {
            res.status(400).send("-1");
        }
    } 

    static async validateGJP2OrDie(gjp2, accountID, req) {
        const result = await this.isGJP2Valid(accountID, gjp2, req);
        if (result !== 1) {
            return "-1";
        }
    }

    static async getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req) {
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
    
    
    
    
    // circular dependency FIX
    // GeneratePass
    static async GJP2fromPassword(pass, req = '') {
        //console.log(`GJP2fromPassword req: ${req}`);
        return crypto.createHash('sha1').update(pass + "mI29fmAnxgTs").digest('hex');
    }

    static async GJP2hash(pass, req = '') {
        const hash = this.GJP2fromPassword(pass, req);
        //console.log(`GJP2hash req: ${req}`);
        return bcrypt.hashSync(hash, 10);
    }
    static async attemptsFromIP(req) {
        //const ip = getIP(req);
        // debug
        //console.log(`attemptsFromIP req: ${req}`);
        const ip = await FixIp.getIP(req);
        const newtime = Math.floor(Date.now() / 1000) - (60 * 60);
        const [rows] = await db.execute(
            "SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?",
            [newtime, ip]
        );
      //  await db.end();
        return rows[0].count;
    }
    static async tooManyAttemptsFromIP(req) {
        //console.log(`tooManyAttemptsFromIP req: ${req}`);
        return this.attemptsFromIP(req) > 7;
    }
    static async assignModIPs(accountID, ip, req) {
        //console.log(`assignModIPs req: ${req}`);
        const modipCategory = await ApiLib.getMaxValuePermission(accountID, "modipCategory");
        if (modipCategory > 0) {
            const [rows] = await db.execute("SELECT count(*) as count FROM modips WHERE accountID = ?", [accountID]);
            if (rows[0].count > 0) {
                await db.execute("UPDATE modips SET IP = ?, modipCategory = ? WHERE accountID = ?", [ip, modipCategory, accountID]);
            } else {
                await db.execute("INSERT INTO modips (IP, accountID, isMod, modipCategory) VALUES (?, ?, '1', ?)", [ip, accountID, modipCategory]);
            }
        }
    }
    
    static async logInvalidAttemptFromIP(accid, req) {
        //debug
        //console.log(`logInvalidAttemptFromIP req: ${req}`);
        const ip = await FixIp.getIP(req);
        const time = Math.floor(Date.now() / 1000);
        await db.execute(
            "INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)",
            [accid, time, ip]
        );
    }
    static async isGJP2Valid(accid, gjp2, req) {
        //console.log(`isGJP2Valid req: ${req}`);
        if (await this.tooManyAttemptsFromIP(req)) { 
            //console.log('tooManyAttemptsFromIP');
            return -1;
        } 
        const [rows] = await db.execute("SELECT gjp2, isActive FROM accounts WHERE accountID = ?", [accid]);
        if (rows.length === 0) return 0;

        const userInfo = rows[0];
        if (!userInfo.gjp2) return -2;

        const isPasswordValid = await bcrypt.compare(gjp2, userInfo.gjp2);
        if (isPasswordValid) {
            await this.assignModIPs(accid, FixIp.getIP(req), req);
            return userInfo.isActive ? 1: -2;
        } else {
            await this.logInvalidAttemptFromIP(accid, req);
            return 0;
        }
    }
    static async assignGJP2(accid, pass, req) {
        //console.log(`assignGJP2 req: ${req}`);
        const query = "UPDATE accounts SET gjp2 = ? WHERE accountID = ?";
        const gjp2 = await this.GJP2hash(pass, req);
        try {
            const [results] = await db.execute(query, [gjp2, accid]);
            return results;
        } catch (error) {
            ConsoleApi.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
            throw error;
        }
    }
    static async isGJP2ValidUsrname(userName, gjp2, req) {
        //console.log(`isGJP2ValidUsrname req: ${req}`);
        try {
            const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
            if (rows.length === 0) {
                return 0;
            }
            const accID = rows[0].accountID;
            return await this.isGJP2Valid(accID, gjp2, req);
        } catch (error) {
            ConsoleApi.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.GJPCheck`);
            return 0;
        }
    }

    static async isValid(accid, pass, req) {
        //console.log(`isValid req: ${req}`);
        if (await this.tooManyAttemptsFromIP(req)) return -1;

        const [rows] = await db.execute("SELECT accountID, salt, password, isActive, gjp2 FROM accounts WHERE accountID = ?", [accid]);
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

    static async isValidUsrname(userName, pass, req) {
        //console.log(`isValidUsrname req: ${req}`);
        const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
        if (rows.length === 0) return 0;

        const accID = rows[0].accountID;
        return await this.isValid(accID, pass, req);
    }
}

module.exports = GJPCheck;
