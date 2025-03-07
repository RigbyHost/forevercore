'package net.fimastgd.forevercore.api.levels.uploadLevel';

import { Request } from 'express';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import path from 'path';
import fs from 'fs/promises';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import FixIp from '../lib/fixIp';
import GJPCheck from '../lib/GJPCheck';
import db from '../../serverconf/db';
import settings from '../../serverconf/settings';
import ConsoleApi from '../../modules/console-api';

/**
 * Upload a level to the server
 * @param passwordStr - Level password
 * @param udidStr - Device ID
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param gameVersionStr - Game version
 * @param userNameStr - Username
 * @param levelIDStr - Level ID (for updates)
 * @param levelNameStr - Level name
 * @param levelDescStr - Level description
 * @param levelVersionStr - Level version
 * @param levelLengthStr - Level length
 * @param audioTrackStr - Audio track ID
 * @param secretStr - Secret token
 * @param binaryVersionStr - Binary version
 * @param autoStr - Auto flag
 * @param originalStr - Original flag
 * @param twoPlayerStr - Two player flag
 * @param songIDStr - Song ID
 * @param objectsStr - Object count
 * @param coinsStr - Coin count
 * @param requestedStarsStr - Requested stars
 * @param extraStringStr - Extra string data
 * @param levelStringStr - Level data
 * @param levelInfoStr - Level info
 * @param unlistedStr - Unlisted flag
 * @param unlisted1Str - Unlisted flag (alternate)
 * @param unlisted2Str - Unlisted flag (alternate)
 * @param ldmStr - LDM flag
 * @param wtStr - WT flag
 * @param wt2Str - WT2 flag
 * @param settingsStringStr - Settings string
 * @param songIDsStr - Song IDs string
 * @param sfxIDsStr - SFX IDs string
 * @param tsStr - Timestamp
 * @param req - Express request
 * @returns Level ID if successful, "-1" if failed
 */
const uploadLevel = async (
    passwordStr?: string,
    udidStr?: string,
    accountIDStr?: string,
    gjp2Str?: string,
    gjpStr?: string,
    gameVersionStr?: string,
    userNameStr?: string,
    levelIDStr?: string,
    levelNameStr?: string,
    levelDescStr?: string,
    levelVersionStr?: string,
    levelLengthStr?: string,
    audioTrackStr?: string,
    secretStr?: string,
    binaryVersionStr?: string,
    autoStr?: string,
    originalStr?: string,
    twoPlayerStr?: string,
    songIDStr?: string,
    objectsStr?: string,
    coinsStr?: string,
    requestedStarsStr?: string,
    extraStringStr?: string,
    levelStringStr?: string,
    levelInfoStr?: string,
    unlistedStr?: string,
    unlisted1Str?: string,
    unlisted2Str?: string,
    ldmStr?: string,
    wtStr?: string,
    wt2Str?: string,
    settingsStringStr?: string,
    songIDsStr?: string,
    sfxIDsStr?: string,
    tsStr?: string,
    req?: Request
): Promise<string> => {
    try {
        // Default extra string for compatibility
        const _EXTRA_STRING = ["29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29"];

        // Process and validate input parameters
        let gjp2check = gjp2Str || gjpStr;
        let gjp = await ExploitPatch.remove(gjp2check);
        let gameVersion = await ExploitPatch.remove(gameVersionStr);
        let userName = await ExploitPatch.charclean(userNameStr);
        let levelID = await ExploitPatch.remove(levelIDStr);
        let levelName = await ExploitPatch.charclean(levelNameStr);

        // Process level description
        let rawDesc: string;
        let levelDesc = await ExploitPatch.remove(levelDescStr);

        if (parseInt(gameVersion) < 20) {
            // Old game version - encode base64
            rawDesc = levelDesc;
            levelDesc = Buffer.from(rawDesc).toString("base64");
            levelDesc = levelDesc.replace(/\+/g, "-").replace(/\//g, "_");
        } else {
            // New game version - parse and fix tags
            rawDesc = Buffer.from(levelDesc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();

            if (rawDesc.includes("<c")) {
                const tags = rawDesc.split("<c").length - 1;
                const closingTags = rawDesc.split("</c>").length - 1;

                if (tags > closingTags) {
                    for (let i = 0; i < tags - closingTags; i++) {
                        rawDesc += "</c>";
                    }
                }
            }

            levelDesc = Buffer.from(rawDesc).toString("base64");
            levelDesc = levelDesc.replace(/\+/g, "-").replace(/\//g, "_");
        }

        // Process remaining parameters
        let levelVersion = await ExploitPatch.remove(levelVersionStr);
        let levelLength = await ExploitPatch.remove(levelLengthStr);
        let audioTrack = await ExploitPatch.remove(audioTrackStr);
        let secret = await ExploitPatch.remove(secretStr);

        // Set defaults for optional parameters
        let binaryVersion = binaryVersionStr ? await ExploitPatch.remove(binaryVersionStr) : "0";
        let auto = autoStr ? await ExploitPatch.remove(autoStr) : "0";
        let original = originalStr ? await ExploitPatch.remove(originalStr) : "0";
        let twoPlayer = twoPlayerStr ? await ExploitPatch.remove(twoPlayerStr) : "0";
        let songID = songIDStr ? await ExploitPatch.remove(songIDStr) : "0";
        let objects = objectsStr ? await ExploitPatch.remove(objectsStr) : "0";
        let coins = coinsStr ? await ExploitPatch.remove(coinsStr) : "0";
        let requestedStars = requestedStarsStr ? await ExploitPatch.remove(requestedStarsStr) : "0";
        let extraString = extraStringStr ? await ExploitPatch.remove(extraStringStr) : _EXTRA_STRING[0];
        let levelString = levelStringStr ? await ExploitPatch.remove(levelStringStr) : "";
        let levelInfo = levelInfoStr ? await ExploitPatch.remove(levelInfoStr) : "";

        // GD 2.2 parameters
        let unlistedTest = unlistedStr ? await ExploitPatch.remove(unlistedStr) : "0";
        let unlisted = unlisted1Str ? await ExploitPatch.remove(unlisted1Str) : unlistedTest;
        let unlisted2 = unlisted2Str ? await ExploitPatch.remove(unlisted2Str) : unlisted;
        let ldm = ldmStr ? await ExploitPatch.remove(ldmStr) : "0";
        let wt = wtStr ? await ExploitPatch.remove(wtStr) : "0";
        let wt2 = wt2Str ? await ExploitPatch.remove(wt2Str) : "0";
        let settingsString = settingsStringStr ? await ExploitPatch.remove(settingsStringStr) : "";
        let songIDs = songIDsStr ? await ExploitPatch.numbercolon(songIDsStr) : "";
        let sfxIDs = sfxIDsStr ? await ExploitPatch.numbercolon(sfxIDsStr) : "";
        let ts = tsStr ? await ExploitPatch.number(tsStr) : "0";

        // Check object limit if enabled
        if (settings.objectLimitFU === true) {
            if (settings.objectLimitCount < 5 || settings.objectLimitCount > 500) {
                ConsoleApi.FatalError("main", "Config error: settings.objectLimitCount must be more than 5 and less than 500");
                return "-1";
            }

            if (parseInt(objects) < settings.objectLimitCount) {
                ConsoleApi.Log("main", `Level ${levelName} could not be uploaded by object limit`);
                return "-1";
            }
        }

        // Process password
        let password = typeof passwordStr !== "undefined" ? await ExploitPatch.remove(passwordStr) : "1";

        if (parseInt(gameVersion) > 17) {
            password = "0";
        }

        // Get user ID
        let id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        let hostname = await FixIp.getIP(req);
        let userID = await ApiLib.getUserID(id, userName);
        let uploadDate = Math.floor(Date.now() / 1000);

        // Check for upload rate limiting
        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM levels WHERE uploadDate > ? AND (userID = ? OR hostname = ?)",
            [uploadDate - 60, userID, hostname]
        );

        if (rows[0].count > 0) {
            return "-1";
        }

        // Prepare SQL insertion or update
        if (levelString !== "" && levelName !== "") {
            // Check if updating existing level
            const [rowse] = await db.query<RowDataPacket[]>(
                "SELECT levelID FROM levels WHERE levelName = ? AND userID = ?",
                [levelName, userID]
            );

            // Get level ID if exists
            if (rowse.length > 0) {
                levelID = rowse[0].levelID.toString();
            }

            // Update or insert level
            if (rowse.length === 1) {
                // Update existing level
                const updateQuery = `
                    UPDATE levels
                    SET levelName = ?, gameVersion = ?, binaryVersion = ?, userName = ?,
                        levelDesc = ?, levelVersion = ?, levelLength = ?, audioTrack = ?,
                        auto = ?, password = ?, original = ?, twoPlayer = ?, songID = ?,
                        objects = ?, coins = ?, requestedStars = ?, extraString = ?,
                        levelString = ?, levelInfo = ?, secret = ?, updateDate = ?,
                        unlisted = ?, hostname = ?, isLDM = ?, wt = ?, wt2 = ?,
                        unlisted2 = ?, settingsString = ?, songIDs = ?, sfxIDs = ?, ts = ?
                    WHERE levelName = ? AND extID = ?`;

                await db.execute(
                    updateQuery,
                    [
                        levelName, gameVersion, binaryVersion, userName,
                        levelDesc, levelVersion, levelLength, audioTrack,
                        auto, password, original, twoPlayer, songID,
                        objects, coins, requestedStars, extraString,
                        levelString, levelInfo, secret, uploadDate,
                        unlisted, hostname, ldm, wt, wt2,
                        unlisted2, settingsString, songIDs, sfxIDs, ts,
                        levelName, id
                    ]
                );

                // Save level data to file
                const lvlPath = path.join("./data/levels", `${levelID}.dat`);
                await fs.writeFile(lvlPath, levelString);

                return levelID;
            } else {
                // Insert new level
                const insertQuery = `
                    INSERT INTO levels
                    (levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack,
                     auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString,
                     levelString, levelInfo, secret, uploadDate, userID, extID, updateDate, unlisted, hostname,
                     isLDM, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const [result] = await db.execute<ResultSetHeader>(
                    insertQuery,
                    [
                        levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion,
                        levelLength, audioTrack, auto, password, original, twoPlayer, songID,
                        objects, coins, requestedStars, extraString, levelString, levelInfo,
                        secret, uploadDate, userID, id, uploadDate, unlisted, hostname, ldm,
                        wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts
                    ]
                );

                // Get new level ID
                levelID = result.insertId.toString();

                // Save level data to file
                const lvlPath = path.join("./data/levels", `${levelID}.dat`);
                await fs.writeFile(lvlPath, levelString);

                ConsoleApi.Log("main", `Level ${levelName} (${levelID}.dat) uploaded`);
                return levelID;
            }
        } else {
            ConsoleApi.Log("main", "Level could not be uploaded: levelstring and levelname are empty");
            return "-1";
        }
    } catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.uploadLevel`);
        return "-1";
    }
};

export default uploadLevel;