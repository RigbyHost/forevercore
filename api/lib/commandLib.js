'package net.fimastgd.forevercore.api.lib.commandLib';

const db = require("../../serverconf/db");
const ApiLib = require("./apiLib");
const ExploitPatch = require("./exploitPatch");
const fs = require("fs");
const path = require("path");
const cp = require("../system/calculateCPs");

class CommandLib {
    static async ownCommand(comment, command, accountID, targetExtID) {
        const commandInComment = `!${command.toLowerCase()}`;
        const commandInPerms = command.charAt(0).toUpperCase() + command.slice(1).toLowerCase();
        const commandlength = commandInComment.length;

        if (comment.substr(0, commandlength) == commandInComment && ((await ApiLib.checkPermission(accountID, `command${commandInPerms}All`)) || (targetExtID == accountID && (await ApiLib.checkPermission(accountID, `command${commandInPerms}Own`))))) {
            return true;
        }
        return false;
    }
    static async doCommands(accountID, comment, levelID) {
        if (!Number.isFinite(accountID)) {
            return false;
        }
        if (levelID < 0) return await this.doListCommands(accountID, comment, levelID);
        const commentarray = comment.split(" ");
        const uploadDate = Math.floor(Date.now() / 1000);

        // LEVELINFO
        const [rows] = await db.execute("SELECT extID FROM levels WHERE levelID = ?", [levelID]);
        const targetExtID = rows[0]?.extID;

        // ADMIN COMMANDS
        if (comment.startsWith("!rate") && (await ApiLib.checkPermission(accountID, "commandRate"))) {
            let starStars = commentarray[2] ? commentarray[2] : 0;
            const starCoins = commentarray[3] ? commentarray[3] : 0;
            const starFeatured = commentarray[4] ? commentarray[4] : 0;
            let starEpic = commentarray[5] ? commentarray[5] : 0;
            const diffArray = await ApiLib.getDiffFromName(commentarray[1]);
            const [starDifficulty, starDemon, starAuto] = diffArray;
            
            if (isNaN(starEpic)) {
                switch (starEpic) {
                    case "none":
                        starEpic = 0;
                        break;
                    case "epic":
                        starEpic = 1;
                        break;
                    case "legendary":
                        starEpic = 2;
                        break;
                    case "godlike":
                    case "mythic":
                        starEpic = 3;
                        break;
                    default:
                        starEpic = 0;
                        break;
                }
            } else {
                if (starEpic > 3) {
                    starEpic = 3;
                }
            }
            
            await db.execute("UPDATE levels SET starStars=?, starDifficulty=?, starDemon=?, starAuto=?, rateDate=?, starFeatured=?, starEpic=?, starCoins=? WHERE levelID=?", [starStars, starDifficulty, starDemon, starAuto, uploadDate, starFeatured, starEpic, starCoins, levelID]);

            await db.execute("INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (?, ?, ?, ?, ?, ?)", [1, commentarray[1], starStars, levelID, uploadDate, accountID]);

            if (starFeatured) {
                await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [2, starFeatured, levelID, uploadDate, accountID]);
                await db.execute("UPDATE levels SET starFeatured=? WHERE levelID=?", [starFeatured, levelID]);
            }
            if (starCoins) {
                await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [3, starCoins, levelID, uploadDate, accountID]);
                await db.execute("UPDATE levels SET starCoins=? WHERE levelID=?", [starCoins, levelID]);
            }
            cp.calculate();
            return true;
        } else if (comment.startsWith("!rate") && !(await ApiLib.checkPermission(accountID, "commandRate"))) {
            return "NO";
        }
        if (comment.startsWith("!unrate") && (await ApiLib.checkPermission(accountID, "commandUnrate"))) {
            let starStars = 0;
            const starCoins = 0;
            const starFeatured = 0;
            const starEpic = 0;
            const diffArray = await ApiLib.getDiffFromName("na");
            const [starDifficulty, starDemon, starAuto] = diffArray;

            await db.execute("UPDATE levels SET starStars=?, starDifficulty=?, starDemon=?, starAuto=?, rateDate=?, starEpic=?, starFeatured=? WHERE levelID=?", [starStars, starDifficulty, starDemon, starAuto, uploadDate, starEpic, starFeatured, levelID]);

            await db.execute("INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (?, ?, ?, ?, ?, ?)", [1, "!unrate", starStars, levelID, uploadDate, accountID]);

            if (starFeatured) {
                await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [2, starFeatured, levelID, uploadDate, accountID]);
                await db.execute("UPDATE levels SET starFeatured=? WHERE levelID=?", [starFeatured, levelID]);
            }
            if (starCoins) {
                await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [3, starCoins, levelID, uploadDate, accountID]);
                await db.execute("UPDATE levels SET starCoins=? WHERE levelID=?", [starCoins, levelID]);
            }
            cp.calculate();
            return true;
        } else if (comment.startsWith("!rate") && !(await ApiLib.checkPermission(accountID, "commandRate"))) {
            return "NO";
        }

        if (comment.startsWith("!feature") && (await ApiLib.checkPermission(accountID, "commandFeature"))) {
            await db.execute("UPDATE levels SET starFeatured='1' WHERE levelID=?", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [2, "1", levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!feature") && !(await ApiLib.checkPermission(accountID, "commandFeature"))) {
            return "NO";
        } 

        if (comment.startsWith("!epic") && (await ApiLib.checkPermission(accountID, "commandEpic"))) {
            await db.execute("UPDATE levels SET starEpic='1' WHERE levelID=?", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [4, "1", levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!epic") && !(await ApiLib.checkPermission(accountID, "commandEpic"))) {
            return "NO";
        }

        if (comment.startsWith("!unepic") && (await ApiLib.checkPermission(accountID, "commandUnepic"))) {
            await db.execute("UPDATE levels SET starEpic='0' WHERE levelID=?", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [4, "0", levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!unepic") && !(await ApiLib.checkPermission(accountID, "commandUnepic"))) {
            return "NO";
        }

        if (comment.startsWith("!verifycoins") && (await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            await db.execute("UPDATE levels SET starCoins='1' WHERE levelID=?", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [2, "1", levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!verifycoins") && !(await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            return "NO";
        }
        
        if (comment.startsWith("!unverifycoins") && (await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            await db.execute("UPDATE levels SET starCoins='0' WHERE levelID=?", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [2, "1", levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!unverifycoins") && (await ApiLib.checkPermission(accountID, "commandUnverifycoins"))) {
            return "NO";
        }

        if (comment.startsWith("!daily") && (await ApiLib.checkPermission(accountID, "commandDaily"))) {
            const [dailyCount] = await db.execute("SELECT count(*) FROM dailyfeatures WHERE levelID = ? AND type = 0", [levelID]);
            if (dailyCount[0]["count(*)"] != 0) {
                return false;
            }
            const [timestampRow] = await db.execute("SELECT timestamp FROM dailyfeatures WHERE timestamp >= ? AND type = 0 ORDER BY timestamp DESC LIMIT 1", [Math.floor(Date.now() / 1000) + 86400]);
            const timestamp = timestampRow.length == 0 ? Math.floor(Date.now() / 1000) + 86400 : timestampRow[0].timestamp + 86400;

            await db.execute("INSERT INTO dailyfeatures (levelID, timestamp, type) VALUES (?, ?, 0)", [levelID, timestamp]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account, value2, value4) VALUES (?, ?, ?, ?, ?, ?, ?)", [5, "1", levelID, uploadDate, accountID, timestamp, 0]);
            return true;
        } else if (comment.startsWith("!daily") && !(await ApiLib.checkPermission(accountID, "commandDaily"))) {
            return "NO";
        }

        if (comment.startsWith("!weekly") && (await ApiLib.checkPermission(accountID, "commandWeekly"))) {
            const [weeklyCount] = await db.execute("SELECT count(*) FROM dailyfeatures WHERE levelID = ? AND type = 1", [levelID]);
            if (weeklyCount[0]["count(*)"] != 0) {
                return false;
            }
            const [timestampRow] = await db.execute("SELECT timestamp FROM dailyfeatures WHERE timestamp >= ? AND type = 1 ORDER BY timestamp DESC LIMIT 1", [Math.floor(Date.now() / 1000) + 604800]);
            const timestamp = timestampRow.length == 0 ? Math.floor(Date.now() / 1000) + 604800 : timestampRow[0].timestamp + 604800;

            await db.execute("INSERT INTO dailyfeatures (levelID, timestamp, type) VALUES (?, ?, 1)", [levelID, timestamp]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account, value2, value4) VALUES (?, ?, ?, ?, ?, ?, ?)", [5, "1", levelID, uploadDate, accountID, timestamp, 1]);
            return true;
        } else if (comment.startsWith("!weekly") && !(await ApiLib.checkPermission(accountID, "commandWeekly"))) {
            return "NO";
        }

        if (comment.startsWith("!delete") && (await ApiLib.checkPermission(accountID, "commandDelete"))) {
           // if (!Number.isFinite(levelID)) {
           //     return false;
           // }
            await db.execute("DELETE from levels WHERE levelID=? LIMIT 1", [levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [6, "1", levelID, uploadDate, accountID]);
            // const levelPath = `${__dirname}../../data/levels/${levelID}`;
            const levelPath = path.join(__dirname, "..", "..", "data", "levels", levelID);
            const deletedPath = path.join(__dirname, "..", "..", "data", "levels", "deleted", levelID);
            // const deletedPath = `${__dirname}../../data/levels/deleted/${levelID}`;
            if (fs.existsSync(levelPath)) {
                fs.renameSync(levelPath, deletedPath);
            }
            return true;
        } else if (comment.startsWith("!delete") && !(await ApiLib.checkPermission(accountID, "commandDelete"))) {
            return "NO";
        }

        if (comment.startsWith("!setacc") && (await ApiLib.checkPermission(accountID, "commandSetacc"))) {
            const [accountRows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ? OR accountID = ? LIMIT 1", [commentarray[1], commentarray[1]]);
            if (accountRows.length == 0) {
                return false;
            }
            const targetAcc = accountRows[0].accountID;

            const [userRows] = await db.execute("SELECT userID FROM users WHERE extID = ? LIMIT 1", [targetAcc]);
            const userID = userRows[0]?.userID;

            await db.execute("UPDATE levels SET extID=?, userID=?, userName=? WHERE levelID=?", [targetAcc, userID, commentarray[1], levelID]);
            await db.execute("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)", [7, commentarray[1], levelID, uploadDate, accountID]);
            return true;
        } else if (comment.startsWith("!setacc") && !(await ApiLib.checkPermission(accountID, "commandSetacc"))) {
            return "NO";
        }

        // NON-ADMIN COMMANDS
        if (await this.ownCommand(comment, "rename", accountID, targetExtID)) {
            const name = await ExploitPatch.remove(comment.replace("!rename ", ""));
            await db.execute("UPDATE levels SET levelName=? WHERE levelID=?", [name, levelID]);
            await db.execute("INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)", [8, name, uploadDate, accountID, levelID]);
            return true;
        }

        if (await this.ownCommand(comment, "pass", accountID, targetExtID)) {
            let pass = await ExploitPatch.remove(comment.replace("!pass ", ""));
            if (Number.isFinite(pass)) {
                pass = pass.toString().padStart(6, "0");
                if (pass == "000000") {
                    pass = "";
                }
                pass = "1" + pass;
                await db.execute("UPDATE levels SET password=? WHERE levelID=?", [pass, levelID]);
                await db.execute("INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)", [9, pass, uploadDate, accountID, levelID]);
                return true;
            }
        }

        if (await this.ownCommand(comment, "description", accountID, targetExtID)) {
            const desc = Buffer.from(await ExploitPatch.remove(comment.replace("!description ", ""))).toString("base64");
            await db.execute("UPDATE levels SET levelDesc=? WHERE levelID=?", [desc, levelID]);
            await db.execute("INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)", [13, desc, uploadDate, accountID, levelID]);
            return true;
        }
        return false;
    }
    static async doListCommands(accountID, command, listID) {
        if (command.substr(0, 1) != "!") return false;
        listID = listID * -1;
        const carray = command.split(" ");

        switch (carray[0]) {
            case "!r":
            case "!rate":
                const [getList] = await db.query("SELECT * FROM lists WHERE listID = ?", [listID]);
                const reward = await ExploitPatch.number(carray[1]);
                let diff = await ExploitPatch.charclean(carray[2]);
                const featured = isNaN(carray[3]) ? await ExploitPatch.number(carray[4]) : await ExploitPatch.number(carray[3]);
                let count = isNaN(carray[3]) ? await ExploitPatch.number(carray[5]) : await ExploitPatch.number(carray[4]);

                if (!count) {
                    const levelsCount = getList[0].listlevels;
                    count = levelsCount.split(",").length;
                }

                if (isNaN(diff)) {
                    diff = diff.toLowerCase();
                    if (carray[3] && carray[3].toLowerCase() == "demon") {
                        const diffList = { easy: 1, medium: 2, hard: 3, insane: 4, extreme: 5 };
                        diff = 5 + diffList[diff];
                    } else {
                        const diffList = { na: -1, auto: 0, easy: 1, normal: 2, hard: 3, harder: 4, demon: 5 };
                        diff = diffList[diff];
                    }
                }

                if (diff == undefined) diff = getList[0].starDifficulty;

                if (await ApiLib.checkPermission(accountID, "commandRate")) {
                    await db.query("UPDATE lists SET starStars = ?, starDifficulty = ?, starFeatured = ?, countForReward = ? WHERE listID = ?", [reward, diff, featured, count, listID]);
                    await db.query("INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (30, ?, ?, ?, ?, ?)", [reward, diff, listID, Math.floor(Date.now() / 1000), accountID]);
                } else if (await ApiLib.checkPermission(accountID, "actionSuggestRating")) {
                    await db.query("INSERT INTO suggest (suggestBy, suggestLevelId, suggestDifficulty, suggestStars, suggestFeatured, timestamp) VALUES (?, ?, ?, ?, ?, ?)", [accountID, listID * -1, diff, reward, featured, Math.floor(Date.now() / 1000)]);
                    await db.query("INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (31, ?, ?, ?, ?, ?)", [reward, diff, listID, Math.floor(Date.now() / 1000), accountID]);
                } else return false;
                break;

            case "!f":
            case "!feature":
                if (!(await ApiLib.checkPermission(accountID, "commandFeature"))) return false;
                if (!carray[1]) carray[1] = 1;
                await db.query("UPDATE lists SET starFeatured = ? WHERE listID = ?", [carray[1], listID]);
                await db.query("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (32, ?, ?, ?, ?)", [carray[1], listID, Math.floor(Date.now() / 1000), accountID]);
                break;

            case "!un":
            case "!unlist":
                const accCheck = await ApiLib.getListOwner(listID);
                if (!(await ApiLib.checkPermission(accountID, "commandUnlistAll")) && accountID != accCheck) return false;
                if (!carray[1]) carray[1] = 1;
                await db.query("UPDATE lists SET unlisted = ? WHERE listID = ?", [carray[1], listID]);
                await db.query("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (33, ?, ?, ?, ?)", [carray[1], listID, Math.floor(Date.now() / 1000), accountID]);
                break;

            case "!d":
            case "!delete":
                if (!(await ApiLib.checkPermission(accountID, "commandDelete"))) return false;
                await db.query("DELETE FROM lists WHERE listID = ?", [listID]);
                await db.query("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (34, 0, ?, ?, ?)", [listID, Math.floor(Date.now() / 1000), accountID]);
                break;

            case "!acc":
            case "!setacc":
                if (!(await ApiLib.checkPermission(accountID, "commandSetacc"))) return false;
                let acc;
                if (!isNaN(carray[1])) acc = await ExploitPatch.number(carray[1]);
                else acc = await ApiLib.getAccountIDFromName(await ExploitPatch.charclean(carray[1]));
                if (!acc) return false;
                await db.query("UPDATE lists SET accountID = ? WHERE listID = ?", [acc, listID]);
                await db.query("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (35, ?, ?, ?, ?)", [acc, listID, Math.floor(Date.now() / 1000), accountID]);
                break;

            case "!re":
            case "!rename":
                const accCheckRename = await ApiLib.getListOwner(listID);
                if (!(await ApiLib.checkPermission(accountID, "commandRenameAll")) && accountID != accCheckRename) return false;
                carray.shift();
                const oldName = await ApiLib.getListName(listID);
                const name = await ExploitPatch.charclean(carray.join(" ")).trim();
                await db.query("UPDATE lists SET listName = ? WHERE listID = ?", [name, listID]);
                await db.query("INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (36, ?, ?, ?, ?, ?)", [name, oldName, listID, Math.floor(Date.now() / 1000), accountID]);
                break;

            case "!desc":
            case "!description":
                const accCheckDesc = await ApiLib.getListOwner(listID);
                if (!(await ApiLib.checkPermission(accountID, "commandDescriptionAll")) && accountID != accCheckDesc) return false;
                carray.shift();
                const description = Buffer.from(await ExploitPatch.charclean(carray.join(" ")).trim()).toString("base64");
                await db.query("UPDATE lists SET listDesc = ? WHERE listID = ?", [description, listID]);
                await db.query("INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (37, ?, ?, ?, ?)", [description, listID, Math.floor(Date.now() / 1000), accountID]);
                break;
        }
        return true;
    }
}

module.exports = CommandLib;
