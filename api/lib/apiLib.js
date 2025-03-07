'package net.fimastgd.forevercore.api.lib.apiLib';

const db = require("../../serverconf/db");
const ExploitPatch = require("./exploitPatch");
//const GJPCheck = require("./GJPCheck");
const settings = require("../../serverconf/settings");
const XORCipher = require("./XORCipher");
const FixIp = require("./fixIp");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const c = require("ansi-colors");
const ConsoleApi = require("../../modules/console-api");
const { Numbers } = require("../../modules/numbers.ts");
const is = new Numbers();

class ApiLib {
    // fixIp(req) recommended for use
    static getIP(req) {
        if (!req || !req.headers) {
            // console.log(`ERROR WITH IP() HEADERS!!! UNDEFINED!`);
            return `ERROR WITH IP() HEADERS!!!`;
        }
        const forwarded = req.headers["x-forwarded-for"];
        //console.log(forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress);
        return forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress;
    }
    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    static async getMaxValuePermission(accountID, permission) {
        if (isNaN(accountID)) return false;
        let maxvalue = 0;
        try {
            const [roleIDarray] = await db.execute("SELECT roleID FROM roleassign WHERE accountID = ?", [accountID]);
            let roleIDlist = roleIDarray.map((roleIDobject) => roleIDobject.roleID).join(",");
            if (roleIDlist) {
                const [roles] = await db.execute(`SELECT ${permission} FROM roles WHERE roleID IN (${roleIDlist}) ORDER BY priority DESC`);
                roles.forEach((role) => {
                    if (role[permission] > maxvalue) {
                        maxvalue = role[permission];
                    }
                });
            }
        } catch (error) {
            ConsoleApi.Error("main", `Error fetching data: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
        return maxvalue;
    }
    static async getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req) {
        try {
            if (gjpStr) {
                if (udidStr && gameVersionStr < 20 && settings.unregisteredSubmissions) {
                    const id = await ExploitPatch.remove(udidStr);
                    if (Number.isNumeric(id)) {
                        return "-1";
                    }
                } else if (accountIDStr && accountIDStr !== "0") {
                    const id = await this.getAccountIDOrDie(accountIDStr, undefined, gjpStr, req);
                    return id;
                } else {
                    return "-1";
                }
            } else if (gjp2Str) {
                if (udidStr && gameVersionStr < 20 && settings.unregisteredSubmissions) {
                    const id = await ExploitPatch.remove(udidStr);
                    if (Number.isNumeric(id)) {
                        return "-1";
                    }
                } else if (accountIDStr && accountIDStr !== "0") {
                    const id = await this.getAccountIDOrDie(accountIDStr, gjp2Str, undefined, req);
                    return id;
                } else {
                    return "-1";
                }
            }
        } catch (error) {
			ConsoleApi.Error("main", `getIDFromPostException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }
    static async getUserID(extID, userName = "Undefined") {
        var time;
        try {
            let register = this.isNumeric(extID) ? 1 : 0;
            const [rows] = await db.execute("SELECT userID FROM users WHERE extID = ?", [extID]);
            if (rows.length > 0) {
                return rows[0].userID;
            } else {
                time = Math.floor(Date.now() / 1000);
                const [result] = await db.execute("INSERT INTO users (isRegistered, extID, userName, lastPlayed) VALUES (?, ?, ?, ?)", [register, extID, userName, time]);
                return result.insertId;
            }
        } catch (error) {
			ConsoleApi.Error("main", `getUserIDException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }
    static async checkPermission(accountID, permission) {
        function dateNow() {
            const currentDate = new Date();
            const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
            return fDate;
        }
        //if (!Number.isInteger(accountID)) return false;

        try {
            const isAdminQuery = await db.query("SELECT isAdmin FROM accounts WHERE accountID = ?", [accountID]);
            const isAdmin = isAdminQuery[0][0].isAdmin;
            if (isAdmin == 1) {
                //return true;
                return 1;
            }
            const roleIDQuery = await db.query("SELECT roleID FROM roleassign WHERE accountID = ?", [accountID]);
            const roleIDarray = roleIDQuery[0];
            const roleIDlist = roleIDarray.map((roleIDobject) => roleIDobject.roleID).join(",");
            if (roleIDlist) {
                const rolesQuery = await db.query(`SELECT ${permission} FROM roles WHERE roleID IN (${roleIDlist}) ORDER BY priority DESC`);
                const roles = rolesQuery[0];
                for (const role of roles) {
                    if (role[permission] == 1) {
                        return true;
                    }
                    if (role[permission] == 2) {
                        return false;
                    }
                }
            }
            const defaultPermQuery = await db.query(`SELECT ${permission} FROM roles WHERE isDefault = 1`);
            const permState = defaultPermQuery[0][0][permission];
            if (permState == 1) {
                return true;
            } else if (permState == 2) {
                return false;
            }
            return false;
        } catch (error) {
            //console.error(c.red(`[${dateNow()}] [main/ERROR]: Critical error in apiLib.js: ${error}`));
            return false;
        }
    }

    static async getFriends(accountID) {
        /* if (!Number.isInteger(accountID)) { 
            return false;
        } */

        const friendsarray = [];
        const query = "SELECT person1, person2 FROM friendships WHERE person1 = ? OR person2 = ?";

        try {
            const [result] = await db.execute(query, [accountID, accountID]);
            if (result.length == 0) {
                return [];
            } else {
                for (const friendship of result) {
                    const person = friendship.person1 == accountID ? friendship.person2 : friendship.person1;
                    friendsarray.push(person);
                }
            }
            return friendsarray;
        } catch (error) {
            // console.error("Error in getFriends:", error);
            ConsoleApi.Error("main", `getFriendsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return [];
        }
    }

    static async getListLevels(listID) {
        /*if (!Number.isInteger(listID)) {
            return false;
        } */

        try {
            const [result] = await db.execute("SELECT listlevels FROM lists WHERE listID = ?", [listID]);
            const returned = result[0] ? result[0].listlevels : null;
            return result[0] ? result[0].listlevels : null;
        } catch (error) {
            // console.error("Error in getListLevels:", error);
            ConsoleApi.Error("main", `getListLevelsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return null;
        }
    }

    static async isFriends(accountID, targetAccountID) {
        /*if (isNaN(accountID) || isNaN(targetAccountID)) {
            console.log("isFriends returned: false");
            return false;
        } */

        try {
            const [result] = await db.execute("SELECT COUNT(*) as count FROM friendships WHERE (person1 = ? AND person2 = ?) OR (person1 = ? AND person2 = ?)", [accountID, targetAccountID, targetAccountID, accountID]);
            const returned = result[0].count > 0;
            return result[0].count > 0;
        } catch (error) {
            // console.error("Error in isFriends:", error);
            ConsoleApi.Error("main", `isFriendsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }

    static getSongString(song) {
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

    static getUserString(userdata) {
        const extID = Number.isInteger(parseInt(userdata.extID)) ? userdata.extID : 0;
        return `${userdata.userID}:${userdata.userName}:${extID}`;
    }
    static async checkModIPPermission(permission, req) {
        const ip = await FixIp.getIP(req);
        const [categoryRows] = await db.execute("SELECT modipCategory FROM modips WHERE IP = ?", [ip]);
        const categoryID = categoryRows[0]?.modipCategory;
        if (!categoryID) {
            return false;
        }
        const [permRows] = await db.execute(`SELECT ${permission} FROM modipperms WHERE categoryID = ?`, [categoryID]);
        const permState = permRows[0]?.[permission];
        if (permState == 1) {
            return true;
        }
        if (permState == 2) {
            return false;
            //return true;
        }
        return false;
        // return true;
    }
    static getDiffFromStars(stars) {
        try {
            let auto = 0;
            let demon = 0;
            let diffname, diff;
            const starsInt = parseInt(stars);
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
            return { diff: diff, auto: auto, demon: demon, name: diffname };
        } catch (error) {
            // console.error(c.red(`[${dateNow()}] [main/ERROR]: Critical error in ${c.bold("apiLib.js")}: ${err}`));
            ConsoleApi.Error("main", `getDiffFromStarsException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }
    static async rateLevel(accountID, levelID, stars, difficulty, auto, demon) {
        try {
            const updateQuery = "UPDATE levels SET starDemon=?, starAuto=?, starDifficulty=?, starStars=?, rateDate=? WHERE levelID=?";
            await db.execute(updateQuery, [demon, auto, difficulty, stars, Math.floor(Date.now() / 1000), levelID]);
            const insertQuery = "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES ('1', ?, ?, ?, ?, ?)";
            await db.execute(insertQuery, [await this.getDiffFromStars(stars).name, Math.floor(Date.now() / 1000), accountID, stars, levelID]);
        } catch (error) {
            // console.error(c.red(`[${dateNow()}] [main/ERROR]: Critical error in ${c.bold("apiLib.js")}: ${err}`));
            ConsoleApi.Error("main", `rateLevelException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
        }
    }
    static async getListOwner(listID) {
        if (!Number.isInteger(Number(listID))) return false;
        const [rows] = await db.execute("SELECT accountID FROM lists WHERE listID = ?", [listID]);
        return rows.length > 0 ? rows[0].accountID : null;
    }
    static async getAccountIDFromName(userName) {
        const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);
        return rows.length > 0 ? rows[0].accountID : 0;
    }
    static async getListName(listID) {
        if (!Number.isInteger(Number(listID))) return false;
        const [rows] = await db.execute("SELECT listName FROM lists WHERE listID = ?", [listID]);
        return rows.length > 0 ? rows[0].listName : null;
    }
    static async getAccountCommentColor(accountID) {
        if (await !is.Int(accountID)) return false;
        const [roleIDarray] = await db.execute("SELECT roleID FROM roleassign WHERE accountID = ?", [accountID]);
        if (roleIDarray.length > 0) {
            const roleIDlist = roleIDarray.map((role) => role.roleID).join(",");
            const [roles] = await db.execute(`SELECT commentColor FROM roles WHERE roleID IN (${roleIDlist}) ORDER BY priority DESC`);
            for (const role of roles) {
                if (role.commentColor !== "000,000,000") {
                    return role.commentColor;
                }
            }
        }
        const [defaultRoles] = await db.execute("SELECT commentColor FROM roles WHERE isDefault = 1");
        if (defaultRoles.length > 0) {
            return defaultRoles[0].commentColor;
        }
        return "255,255,255";
    }
    static async getDiffFromName(nameStr) {
        const name = nameStr.toLowerCase();
        let starAuto = 0;
        let starDemon = 0;
        let starDifficulty;
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
    static async suggestLevel(accountID, levelID, difficulty, stars, feat, auto, demon) {
        const query = "INSERT INTO suggest (suggestBy, suggestLevelID, suggestDifficulty, suggestStars, suggestFeatured, suggestAuto, suggestDemon, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        await db.execute(query, [accountID, levelID, difficulty, stars, feat, auto, demon, Math.floor(Date.now() / 1000)]);
    }

    static async verifyCoinsLevel(accountID, levelID, coins) {
        const query1 = "UPDATE levels SET starCoins=? WHERE levelID=?";
        await db.execute(query1, [coins, levelID]);

        const query2 = "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES ('3', ?, ?, ?, ?)";
        await db.execute(query2, [coins, levelID, Math.floor(Date.now() / 1000), accountID]);
    }

    static async featureLevel(accountID, levelID, state) {
        let feature = "";
        let epic = "";
        switch (parseInt(state)) {
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
        //console.log("f:", feature, "e:", epic);
        const query1 = "UPDATE levels SET starFeatured=?, starEpic=?, rateDate=? WHERE levelID=?";
        await db.execute(query1, [feature, epic, Math.floor(Date.now() / 1000), levelID]);

        const query2 = "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES ('2', ?, ?, ?, ?)";
        await db.execute(query2, [state, levelID, Math.floor(Date.now() / 1000), accountID]);
    }
    // {
    ///////////////////////////////
    // circular dependency fix ////
    // GJPCheck ///////////////////
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
            return "-1";
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

    // circular dependency fix
    // GeneratePass
    static async GJP2fromPassword(pass, req = "") {
        //console.log(`GJP2fromPassword req: ${req}`);
        return crypto
            .createHash("sha1")
            .update(pass + "mI29fmAnxgTs")
            .digest("hex");
    }

    static async GJP2hash(pass, req = "") {
        const hash = this.GJP2fromPassword(pass, req);
        //console.log(`GJP2hash req: ${req}`);
        return bcrypt.hashSync(hash, 10);
    }
    static async attemptsFromIP(req) {
        //const ip = getIP(req);
        // debug
        //console.log(`attemptsFromIP req: ${req}`);
        const ip = await FixIp.getIP(req);
        const newtime = Math.floor(Date.now() / 1000) - 60 * 60;
        const [rows] = await db.execute("SELECT count(*) as count FROM actions WHERE type = '6' AND timestamp > ? AND value2 = ?", [newtime, ip]);
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
        await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES ('6', ?, ?, ?)", [accid, time, ip]);
    }
    static async isGJP2Valid(accid, gjp2, req) {
        //console.log(`isGJP2Valid req: ${req}`);
        if (await this.tooManyAttemptsFromIP(req)) {
            //console.log("tooManyAttemptsFromIP");
            return -1;
        }
        const [rows] = await db.execute("SELECT gjp2, isActive FROM accounts WHERE accountID = ?", [accid]);
        if (rows.length === 0) return 0;

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
    static async assignGJP2(accid, pass, req) {
        //console.log(`assignGJP2 req: ${req}`);
        const query = "UPDATE accounts SET gjp2 = ? WHERE accountID = ?";
        const gjp2 = await this.GJP2hash(pass, req);
        try {
            const [results] = await db.execute(query, [gjp2, accid]);
            return results;
        } catch (error) {
            ConsoleApi.Error("main", `assignGJP2Exception: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return "-1";
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
            ConsoleApi.Error("main", `isGJP2ValidUsrnameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
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
            return result.isActive ? 1 : -2;
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
    
    static async getAccountName(accountID) {
        if (isNaN(accountID)) return false;
        try {
            const [rows] = await db.execute("SELECT userName FROM accounts WHERE accountID = ?", [accountID]);
            
            if (rows.length > 0) {
                return rows[0].userName;
            } else {
                return false;
            }
        } catch (error) {
            ConsoleApi.Error("main", `getAccountNameException: ${error} at net.fimastgd.forevercore.api.lib.apiLib`);
            return false;
        }
    }
    
    static async getDifficulty(diff, auto, demon) {
        if (auto != 0) {
            return "Auto";
        } else if (demon != 0) {
            return "Demon";
        } else {
            switch (diff) {
                case 0:
                    return "N/A";
                    break;
                case 10:
                    return "Easy";
                    break;
                case 20:
                    return "Normal";
                    break;
                case 30:
                    return "Hard";
                    break;
                case 40:
                    return "Harder";
                    break;
                case 50:
                    return "Insane";
                    break;
                default:
                    return "Unknown";
                    break;
            }
        }
    }
}

module.exports = ApiLib;
