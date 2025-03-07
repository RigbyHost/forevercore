'package net.fimastgd.forevercore.api.lib.commandLib';

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ApiLib from './apiLib';
import ExploitPatch from './exploitPatch';
import fs from 'fs';
import path from 'path';
import { calculate } from '../system/calculateCPs';
import ConsoleApi from '../../modules/console-api';

/**
 * Command processing library for level comments
 */
class CommandLib {
    /**
     * Check if a user can use a command on a level
     * @param comment - Comment text
     * @param command - Command name
     * @param accountID - User account ID
     * @param targetExtID - Level owner account ID
     * @returns True if user can use command
     */
    static async ownCommand(
        comment: string,
        command: string,
        accountID: number | string,
        targetExtID: number | string
    ): Promise<boolean> {
        const commandInComment = `!${command.toLowerCase()}`;
        const commandInPerms = command.charAt(0).toUpperCase() + command.slice(1).toLowerCase();
        const commandlength = commandInComment.length;

        // Check if comment starts with command and user has permission
        if (comment.substr(0, commandlength) == commandInComment &&
            ((await ApiLib.checkPermission(accountID, `command${commandInPerms}All`)) ||
                (targetExtID == accountID && (await ApiLib.checkPermission(accountID, `command${commandInPerms}Own`))))) {
            return true;
        }
        return false;
    }

    /**
     * Process commands in comments
     * @param accountID - User account ID
     * @param comment - Comment text
     * @param levelID - Level ID
     * @returns true if command processed, "NO" if no permission, false if no command
     */
    static async doCommands(
        accountID: number | string,
        comment: string,
        levelID: number | string
    ): Promise<boolean | string> {
        // Validate input
        if (!Number.isFinite(Number(accountID))) {
            return false;
        }

        // Handle list commands for negative level IDs
        if (Number(levelID) < 0) {
            return await this.doListCommands(accountID, comment, levelID);
        }

        const commentarray = comment.split(" ");
        const uploadDate = Math.floor(Date.now() / 1000);

        // Get level owner
        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT extID FROM levels WHERE levelID = ?",
            [levelID]
        );
        const targetExtID = rows[0]?.extID;

        // Process admin commands

        // !rate command - rate a level with stars, difficulty, etc.
        if (comment.startsWith("!rate") && (await ApiLib.checkPermission(accountID, "commandRate"))) {
            let starStars = commentarray[2] ? commentarray[2] : 0;
            const starCoins = commentarray[3] ? commentarray[3] : 0;
            const starFeatured = commentarray[4] ? commentarray[4] : 0;
            let starEpic = commentarray[5] ? commentarray[5] : 0;
            const diffArray = await ApiLib.getDiffFromName(commentarray[1]);
            const [starDifficulty, starDemon, starAuto] = diffArray;

            // Handle epic value
            if (isNaN(Number(starEpic))) {
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
                if (Number(starEpic) > 3) {
                    starEpic = 3;
                }
            }

            // Update level data
            await db.execute(
                "UPDATE levels SET starStars=?, starDifficulty=?, starDemon=?, starAuto=?, rateDate=?, starFeatured=?, starEpic=?, starCoins=? WHERE levelID=?",
                [starStars, starDifficulty, starDemon, starAuto, uploadDate, starFeatured, starEpic, starCoins, levelID]
            );

            // Log moderation action
            await db.execute(
                "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (?, ?, ?, ?, ?, ?)",
                [1, commentarray[1], starStars, levelID, uploadDate, accountID]
            );

            // Handle featured status
            if (starFeatured) {
                await db.execute(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                    [2, starFeatured, levelID, uploadDate, accountID]
                );
                await db.execute(
                    "UPDATE levels SET starFeatured=? WHERE levelID=?",
                    [starFeatured, levelID]
                );
            }

            // Handle coins
            if (starCoins) {
                await db.execute(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                    [3, starCoins, levelID, uploadDate, accountID]
                );
                await db.execute(
                    "UPDATE levels SET starCoins=? WHERE levelID=?",
                    [starCoins, levelID]
                );
            }

            // Calculate creator points
            calculate();
            return true;
        } else if (comment.startsWith("!rate") && !(await ApiLib.checkPermission(accountID, "commandRate"))) {
            return "NO";
        }

        // !unrate command - remove rating from a level
        if (comment.startsWith("!unrate") && (await ApiLib.checkPermission(accountID, "commandUnrate"))) {
            let starStars = 0;
            const starCoins = 0;
            const starFeatured = 0;
            const starEpic = 0;
            const diffArray = await ApiLib.getDiffFromName("na");
            const [starDifficulty, starDemon, starAuto] = diffArray;

            // Update level data
            await db.execute(
                "UPDATE levels SET starStars=?, starDifficulty=?, starDemon=?, starAuto=?, rateDate=?, starEpic=?, starFeatured=? WHERE levelID=?",
                [starStars, starDifficulty, starDemon, starAuto, uploadDate, starEpic, starFeatured, levelID]
            );

            // Log moderation action
            await db.execute(
                "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (?, ?, ?, ?, ?, ?)",
                [1, "!unrate", starStars, levelID, uploadDate, accountID]
            );

            // Handle featured status
            if (starFeatured) {
                await db.execute(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                    [2, starFeatured, levelID, uploadDate, accountID]
                );
                await db.execute(
                    "UPDATE levels SET starFeatured=? WHERE levelID=?",
                    [starFeatured, levelID]
                );
            }

            // Handle coins
            if (starCoins) {
                await db.execute(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                    [3, starCoins, levelID, uploadDate, accountID]
                );
                await db.execute(
                    "UPDATE levels SET starCoins=? WHERE levelID=?",
                    [starCoins, levelID]
                );
            }

            // Calculate creator points
            calculate();
            return true;
        } else if (comment.startsWith("!rate") && !(await ApiLib.checkPermission(accountID, "commandRate"))) {
            return "NO";
        }

        // !feature command - feature a level
        if (comment.startsWith("!feature") && (await ApiLib.checkPermission(accountID, "commandFeature"))) {
            await db.execute(
                "UPDATE levels SET starFeatured='1' WHERE levelID=?",
                [levelID]
            );
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [2, "1", levelID, uploadDate, accountID]
            );
            return true;
        } else if (comment.startsWith("!feature") && !(await ApiLib.checkPermission(accountID, "commandFeature"))) {
            return "NO";
        }

        // !epic command - set epic status
        if (comment.startsWith("!epic") && (await ApiLib.checkPermission(accountID, "commandEpic"))) {
            await db.execute(
                "UPDATE levels SET starEpic='1' WHERE levelID=?",
                [levelID]
            );
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [4, "1", levelID, uploadDate, accountID]
            );
            return true;
        } else if (comment.startsWith("!epic") && !(await ApiLib.checkPermission(accountID, "commandEpic"))) {
            return "NO";
        }

        // !unepic command - remove epic status
        if (comment.startsWith("!unepic") && (await ApiLib.checkPermission(accountID, "commandUnepic"))) {
            await db.execute(
                "UPDATE levels SET starEpic='0' WHERE levelID=?",
                [levelID]
            );
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [4, "0", levelID, uploadDate, accountID]
            );
            return true;
        } else if (comment.startsWith("!unepic") && !(await ApiLib.checkPermission(accountID, "commandUnepic"))) {
            return "NO";
        }

        // !verifycoins command - verify coins in level
        if (comment.startsWith("!verifycoins") && (await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            await db.execute(
                "UPDATE levels SET starCoins='1' WHERE levelID=?",
                [levelID]
            );
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [2, "1", levelID, uploadDate, accountID]
            );
            return true;
        } else if (comment.startsWith("!verifycoins") && !(await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            return "NO";
        }

        // !unverifycoins command - unverify coins in level
        if (comment.startsWith("!unverifycoins") && (await ApiLib.checkPermission(accountID, "commandVerifycoins"))) {
            await db.execute(
                "UPDATE levels SET starCoins='0' WHERE levelID=?",
                [levelID]
            );
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [2, "1", levelID, uploadDate, accountID]
            );
            return true;
        } else if (comment.startsWith("!unverifycoins") && (await ApiLib.checkPermission(accountID, "commandUnverifycoins"))) {
            return "NO";
        }

        // !daily command - set level as daily
        if (comment.startsWith("!daily") && (await ApiLib.checkPermission(accountID, "commandDaily"))) {
            // Check if level is already a daily
            const [dailyCount] = await db.execute<RowDataPacket[]>(
                "SELECT count(*) as count FROM dailyfeatures WHERE levelID = ? AND type = 0",
                [levelID]
            );

            if (dailyCount[0].count != 0) {
                return false;
            }

            // Calculate timestamp for next daily
            const [timestampRow] = await db.execute<RowDataPacket[]>(
                "SELECT timestamp FROM dailyfeatures WHERE timestamp >= ? AND type = 0 ORDER BY timestamp DESC LIMIT 1",
                [Math.floor(Date.now() / 1000) + 86400]
            );

            const timestamp = timestampRow.length == 0 ?
                Math.floor(Date.now() / 1000) + 86400 :
                timestampRow[0].timestamp + 86400;

            // Set as daily
            await db.execute(
                "INSERT INTO dailyfeatures (levelID, timestamp, type) VALUES (?, ?, 0)",
                [levelID, timestamp]
            );

            // Log action
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account, value2, value4) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [5, "1", levelID, uploadDate, accountID, timestamp, 0]
            );

            return true;
        } else if (comment.startsWith("!daily") && !(await ApiLib.checkPermission(accountID, "commandDaily"))) {
            return "NO";
        }

        // !weekly command - set level as weekly
        if (comment.startsWith("!weekly") && (await ApiLib.checkPermission(accountID, "commandWeekly"))) {
            // Check if level is already a weekly
            const [weeklyCount] = await db.execute<RowDataPacket[]>(
                "SELECT count(*) as count FROM dailyfeatures WHERE levelID = ? AND type = 1",
                [levelID]
            );

            if (weeklyCount[0].count != 0) {
                return false;
            }

            // Calculate timestamp for next weekly
            const [timestampRow] = await db.execute<RowDataPacket[]>(
                "SELECT timestamp FROM dailyfeatures WHERE timestamp >= ? AND type = 1 ORDER BY timestamp DESC LIMIT 1",
                [Math.floor(Date.now() / 1000) + 604800]
            );

            const timestamp = timestampRow.length == 0 ?
                Math.floor(Date.now() / 1000) + 604800 :
                timestampRow[0].timestamp + 604800;

            // Set as weekly
            await db.execute(
                "INSERT INTO dailyfeatures (levelID, timestamp, type) VALUES (?, ?, 1)",
                [levelID, timestamp]
            );

            // Log action
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account, value2, value4) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [5, "1", levelID, uploadDate, accountID, timestamp, 1]
            );

            return true;
        } else if (comment.startsWith("!weekly") && !(await ApiLib.checkPermission(accountID, "commandWeekly"))) {
            return "NO";
        }

        // !delete command - delete level
        if (comment.startsWith("!delete") && (await ApiLib.checkPermission(accountID, "commandDelete"))) {
            // Delete level from database
            await db.execute(
                "DELETE from levels WHERE levelID=? LIMIT 1",
                [levelID]
            );

            // Log action
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [6, "1", levelID, uploadDate, accountID]
            );

            // Move level file to deleted folder
            const levelPath = path.join(__dirname, "..", "..", "data", "levels", levelID.toString());
            const deletedPath = path.join(__dirname, "..", "..", "data", "levels", "deleted", levelID.toString());

            if (fs.existsSync(levelPath)) {
                fs.renameSync(levelPath, deletedPath);
            }

            return true;
        } else if (comment.startsWith("!delete") && !(await ApiLib.checkPermission(accountID, "commandDelete"))) {
            return "NO";
        }

        // !setacc command - change level owner
        if (comment.startsWith("!setacc") && (await ApiLib.checkPermission(accountID, "commandSetacc"))) {
            // Find account by username or ID
            const [accountRows] = await db.execute<RowDataPacket[]>(
                "SELECT accountID FROM accounts WHERE userName = ? OR accountID = ? LIMIT 1",
                [commentarray[1], commentarray[1]]
            );

            if (accountRows.length == 0) {
                return false;
            }

            const targetAcc = accountRows[0].accountID;

            // Get user ID for the account
            const [userRows] = await db.execute<RowDataPacket[]>(
                "SELECT userID FROM users WHERE extID = ? LIMIT 1",
                [targetAcc]
            );

            const userID = userRows[0]?.userID;

            // Update level ownership
            await db.execute(
                "UPDATE levels SET extID=?, userID=?, userName=? WHERE levelID=?",
                [targetAcc, userID, commentarray[1], levelID]
            );

            // Log action
            await db.execute(
                "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (?, ?, ?, ?, ?)",
                [7, commentarray[1], levelID, uploadDate, accountID]
            );

            return true;
        } else if (comment.startsWith("!setacc") && !(await ApiLib.checkPermission(accountID, "commandSetacc"))) {
            return "NO";
        }

        // NON-ADMIN COMMANDS

        // !rename command - rename level (owner only)
        if (await this.ownCommand(comment, "rename", accountID, targetExtID)) {
            const name = await ExploitPatch.remove(comment.replace("!rename ", ""));

            await db.execute(
                "UPDATE levels SET levelName=? WHERE levelID=?",
                [name, levelID]
            );

            await db.execute(
                "INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)",
                [8, name, uploadDate, accountID, levelID]
            );

            return true;
        }

        // !pass command - change level password (owner only)
        if (await this.ownCommand(comment, "pass", accountID, targetExtID)) {
            let pass = await ExploitPatch.remove(comment.replace("!pass ", ""));

            if (Number.isFinite(Number(pass))) {
                pass = pass.toString().padStart(6, "0");

                if (pass == "000000") {
                    pass = "";
                }

                pass = "1" + pass;

                await db.execute(
                    "UPDATE levels SET password=? WHERE levelID=?",
                    [pass, levelID]
                );

                await db.execute(
                    "INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)",
                    [9, pass, uploadDate, accountID, levelID]
                );

                return true;
            }
        }

        // !description command - change level description (owner only)
        if (await this.ownCommand(comment, "description", accountID, targetExtID)) {
            const desc = Buffer.from(await ExploitPatch.remove(comment.replace("!description ", ""))).toString("base64");

            await db.execute(
                "UPDATE levels SET levelDesc=? WHERE levelID=?",
                [desc, levelID]
            );

            await db.execute(
                "INSERT INTO modactions (type, value, timestamp, account, value3) VALUES (?, ?, ?, ?, ?)",
                [13, desc, uploadDate, accountID, levelID]
            );

            return true;
        }

        // No command found
        return false;
    }

    /**
     * Process commands for lists (negative level IDs)
     * @param accountID - User account ID
     * @param command - Command text
     * @param listID - List ID (negative level ID)
     * @returns True if command processed, false if not
     */
    static async doListCommands(
        accountID: number | string,
        command: string,
        listID: number | string
    ): Promise<boolean> {
        // Only process commands that start with !
        if (command.substr(0, 1) != "!") return false;

        // Convert negative level ID to positive list ID
        listID = Number(listID) * -1;
        const carray = command.split(" ");

        switch (carray[0]) {
            // !rate or !r command - rate a list
            case "!r":
            case "!rate":
                const [getList] = await db.query<RowDataPacket[]>(
                    "SELECT * FROM lists WHERE listID = ?",
                    [listID]
                );

                const reward = await ExploitPatch.number(carray[1]);
                let diff = await ExploitPatch.charclean(carray[2]);
                const featured = isNaN(Number(carray[3])) ?
                    await ExploitPatch.number(carray[4]) :
                    await ExploitPatch.number(carray[3]);

                let count = isNaN(Number(carray[3])) ?
                    await ExploitPatch.number(carray[5]) :
                    await ExploitPatch.number(carray[4]);

                // Calculate count from levels if not specified
                if (!count) {
                    const levelsCount = getList[0].listlevels;
                    count = levelsCount.split(",").length;
                }

                // Parse difficulty string to number
                if (isNaN(Number(diff))) {
                    diff = diff.toLowerCase();

                    if (carray[3] && carray[3].toLowerCase() == "demon") {
                        const diffList: { [key: string]: number } = {
                            easy: 1,
                            medium: 2,
                            hard: 3,
                            insane: 4,
                            extreme: 5
                        };

                        diff = (5 + diffList[diff]).toString();
                    } else {
                        const diffList: { [key: string]: number } = {
                            na: -1,
                            auto: 0,
                            easy: 1,
                            normal: 2,
                            hard: 3,
                            harder: 4,
                            demon: 5
                        };

                        diff = diffList[diff];
                    }
                }

                // Use existing difficulty if not specified
                if (diff == undefined) diff = getList[0].starDifficulty;

                // Process based on permissions
                if (await ApiLib.checkPermission(accountID, "commandRate")) {
                    // Direct rating with mod permissions
                    await db.query(
                        "UPDATE lists SET starStars = ?, starDifficulty = ?, starFeatured = ?, countForReward = ? WHERE listID = ?",
                        [reward, diff, featured, count, listID]
                    );

                    await db.query(
                        "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (30, ?, ?, ?, ?, ?)",
                        [reward, diff, listID, Math.floor(Date.now() / 1000), accountID]
                    );
                } else if (await ApiLib.checkPermission(accountID, "actionSuggestRating")) {
                    // Suggest rating without full permissions
                    await db.query(
                        "INSERT INTO suggest (suggestBy, suggestLevelId, suggestDifficulty, suggestStars, suggestFeatured, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                        [accountID, listID * -1, diff, reward, featured, Math.floor(Date.now() / 1000)]
                    );

                    await db.query(
                        "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (31, ?, ?, ?, ?, ?)",
                        [reward, diff, listID, Math.floor(Date.now() / 1000), accountID]
                    );
                } else return false;
                break;

            // !feature or !f command - feature a list
            case "!f":
            case "!feature":
                if (!(await ApiLib.checkPermission(accountID, "commandFeature"))) return false;

                if (!carray[1]) carray[1] = "1";

                await db.query(
                    "UPDATE lists SET starFeatured = ? WHERE listID = ?",
                    [carray[1], listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (32, ?, ?, ?, ?)",
                    [carray[1], listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // !unlist or !un command - unlist a list
            case "!un":
            case "!unlist":
                const accCheck = await ApiLib.getListOwner(listID);

                if (!(await ApiLib.checkPermission(accountID, "commandUnlistAll")) && accountID != accCheck) return false;

                if (!carray[1]) carray[1] = "1";

                await db.query(
                    "UPDATE lists SET unlisted = ? WHERE listID = ?",
                    [carray[1], listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (33, ?, ?, ?, ?)",
                    [carray[1], listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // !delete or !d command - delete a list
            case "!d":
            case "!delete":
                if (!(await ApiLib.checkPermission(accountID, "commandDelete"))) return false;

                await db.query(
                    "DELETE FROM lists WHERE listID = ?",
                    [listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (34, 0, ?, ?, ?)",
                    [listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // !setacc or !acc command - change list owner
            case "!acc":
            case "!setacc":
                if (!(await ApiLib.checkPermission(accountID, "commandSetacc"))) return false;

                let acc;

                if (!isNaN(Number(carray[1]))) {
                    acc = await ExploitPatch.number(carray[1]);
                } else {
                    acc = await ApiLib.getAccountIDFromName(await ExploitPatch.charclean(carray[1]));
                }

                if (!acc) return false;

                await db.query(
                    "UPDATE lists SET accountID = ? WHERE listID = ?",
                    [acc, listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (35, ?, ?, ?, ?)",
                    [acc, listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // !rename or !re command - rename a list
            case "!re":
            case "!rename":
                const accCheckRename = await ApiLib.getListOwner(listID);

                if (!(await ApiLib.checkPermission(accountID, "commandRenameAll")) && accountID != accCheckRename) return false;

                carray.shift();
                const oldName = await ApiLib.getListName(listID);
                const name = await ExploitPatch.charclean(carray.join(" ")).trim();

                await db.query(
                    "UPDATE lists SET listName = ? WHERE listID = ?",
                    [name, listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value2, value3, timestamp, account) VALUES (36, ?, ?, ?, ?, ?)",
                    [name, oldName, listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // !description or !desc command - change list description
            case "!desc":
            case "!description":
                const accCheckDesc = await ApiLib.getListOwner(listID);

                if (!(await ApiLib.checkPermission(accountID, "commandDescriptionAll")) && accountID != accCheckDesc) return false;

                carray.shift();
                const description = Buffer.from(
                    await ExploitPatch.charclean(carray.join(" ")).trim()
                ).toString("base64");

                await db.query(
                    "UPDATE lists SET listDesc = ? WHERE listID = ?",
                    [description, listID]
                );

                await db.query(
                    "INSERT INTO modactions (type, value, value3, timestamp, account) VALUES (37, ?, ?, ?, ?)",
                    [description, listID, Math.floor(Date.now() / 1000), accountID]
                );
                break;

            // Command not recognized
            default:
                return false;
        }

        return true;
    }
}

export default CommandLib;