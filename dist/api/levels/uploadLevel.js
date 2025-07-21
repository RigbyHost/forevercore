'package net.fimastgd.forevercore.api.levels.uploadLevel';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const fixIp_1 = __importDefault(require("../lib/fixIp"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const settings_1 = require("../../serverconf/settings");
const console_api_1 = __importDefault(require("../../modules/console-api"));
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
const uploadLevel = async (passwordStr, udidStr, accountIDStr, gjp2Str, gjpStr, gameVersionStr, userNameStr, levelIDStr, levelNameStr, levelDescStr, levelVersionStr, levelLengthStr, audioTrackStr, secretStr, binaryVersionStr, autoStr, originalStr, twoPlayerStr, songIDStr, objectsStr, coinsStr, requestedStarsStr, extraStringStr, levelStringStr, levelInfoStr, unlistedStr, unlisted1Str, unlisted2Str, ldmStr, wtStr, wt2Str, settingsStringStr, songIDsStr, sfxIDsStr, tsStr, req) => {
    try {
        // Default extra string for compatibility
        const _EXTRA_STRING = ["29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29"];
        // Process and validate input parameters
        let gjp2check = gjp2Str || gjpStr;
        let gjp = await exploitPatch_1.default.remove(gjp2check);
        let gameVersion = await exploitPatch_1.default.remove(gameVersionStr);
        let userName = await exploitPatch_1.default.charclean(userNameStr);
        let levelID = await exploitPatch_1.default.remove(levelIDStr);
        let levelName = await exploitPatch_1.default.charclean(levelNameStr);
        // Process level description
        let rawDesc;
        let levelDesc = await exploitPatch_1.default.remove(levelDescStr);
        if (parseInt(gameVersion) < 20) {
            // Old game version - encode base64
            rawDesc = levelDesc;
            levelDesc = Buffer.from(rawDesc).toString("base64");
            levelDesc = levelDesc.replace(/\+/g, "-").replace(/\//g, "_");
        }
        else {
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
        let levelVersion = await exploitPatch_1.default.remove(levelVersionStr);
        let levelLength = await exploitPatch_1.default.remove(levelLengthStr);
        let audioTrack = await exploitPatch_1.default.remove(audioTrackStr);
        let secret = await exploitPatch_1.default.remove(secretStr);
        // Set defaults for optional parameters
        let binaryVersion = binaryVersionStr ? await exploitPatch_1.default.remove(binaryVersionStr) : "0";
        let auto = autoStr ? await exploitPatch_1.default.remove(autoStr) : "0";
        let original = originalStr ? await exploitPatch_1.default.remove(originalStr) : "0";
        let twoPlayer = twoPlayerStr ? await exploitPatch_1.default.remove(twoPlayerStr) : "0";
        let songID = songIDStr ? await exploitPatch_1.default.remove(songIDStr) : "0";
        let objects = objectsStr ? await exploitPatch_1.default.remove(objectsStr) : "0";
        let coins = coinsStr ? await exploitPatch_1.default.remove(coinsStr) : "0";
        let requestedStars = requestedStarsStr ? await exploitPatch_1.default.remove(requestedStarsStr) : "0";
        let extraString = extraStringStr ? await exploitPatch_1.default.remove(extraStringStr) : _EXTRA_STRING[0];
        let levelString = levelStringStr ? await exploitPatch_1.default.remove(levelStringStr) : "";
        let levelInfo = levelInfoStr ? await exploitPatch_1.default.remove(levelInfoStr) : "";
        // GD 2.2 parameters
        let unlistedTest = unlistedStr ? await exploitPatch_1.default.remove(unlistedStr) : "0";
        let unlisted = unlisted1Str ? await exploitPatch_1.default.remove(unlisted1Str) : unlistedTest;
        let unlisted2 = unlisted2Str ? await exploitPatch_1.default.remove(unlisted2Str) : unlisted;
        let ldm = ldmStr ? await exploitPatch_1.default.remove(ldmStr) : "0";
        let wt = wtStr ? await exploitPatch_1.default.remove(wtStr) : "0";
        let wt2 = wt2Str ? await exploitPatch_1.default.remove(wt2Str) : "0";
        let settingsString = settingsStringStr ? await exploitPatch_1.default.remove(settingsStringStr) : "";
        let songIDs = songIDsStr ? await exploitPatch_1.default.numbercolon(songIDsStr) : "";
        let sfxIDs = sfxIDsStr ? await exploitPatch_1.default.numbercolon(sfxIDsStr) : "";
        let ts = tsStr ? await exploitPatch_1.default.number(tsStr) : "0";
        // Check object limit if enabled
        if (settings_1.settings.objectLimitFU === true) {
            if (settings_1.settings.objectLimitCount < 5 || settings_1.settings.objectLimitCount > 500) {
                console_api_1.default.FatalError("main", "Config error: settings.objectLimitCount must be more than 5 and less than 500");
                return "-1";
            }
            if (parseInt(objects) < settings_1.settings.objectLimitCount) {
                console_api_1.default.Log("main", `Level ${levelName} could not be uploaded by object limit`);
                return "-1";
            }
        }
        // Process password
        let password = typeof passwordStr !== "undefined" ? await exploitPatch_1.default.remove(passwordStr) : "1";
        if (parseInt(gameVersion) > 17) {
            password = "0";
        }
        // Get user ID
        let id = await apiLib_1.default.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        let hostname = await fixIp_1.default.getIP(req);
        let userID = await apiLib_1.default.getUserID(id, userName);
        let uploadDate = Math.floor(Date.now() / 1000);
        // Check for upload rate limiting
        const [rows] = await db_proxy_1.default.execute("SELECT COUNT(*) as count FROM levels WHERE uploadDate > ? AND (userID = ? OR hostname = ?)", [uploadDate - 60, userID, hostname]);
        if (rows[0].count > 0) {
            return "-1";
        }
        // Prepare SQL insertion or update
        if (levelString !== "" && levelName !== "") {
            // Check if updating existing level
            const [rowse] = await db_proxy_1.default.query("SELECT levelID FROM levels WHERE levelName = ? AND userID = ?", [levelName, userID]);
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
                await db_proxy_1.default.execute(updateQuery, [
                    levelName, gameVersion, binaryVersion, userName,
                    levelDesc, levelVersion, levelLength, audioTrack,
                    auto, password, original, twoPlayer, songID,
                    objects, coins, requestedStars, extraString,
                    levelString, levelInfo, secret, uploadDate,
                    unlisted, hostname, ldm, wt, wt2,
                    unlisted2, settingsString, songIDs, sfxIDs, ts,
                    levelName, id
                ]);
                // Save level data to file
                const lvlPath = path_1.default.join("./data/levels", `${levelID}.dat`);
                await promises_1.default.writeFile(lvlPath, levelString);
                return levelID;
            }
            else {
                // Insert new level
                const insertQuery = `
                    INSERT INTO levels
                    (levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack,
                     auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString,
                     levelString, levelInfo, secret, uploadDate, userID, extID, updateDate, unlisted, hostname,
                     isLDM, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = await db_proxy_1.default.execute(insertQuery, [
                    levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion,
                    levelLength, audioTrack, auto, password, original, twoPlayer, songID,
                    objects, coins, requestedStars, extraString, levelString, levelInfo,
                    secret, uploadDate, userID, id, uploadDate, unlisted, hostname, ldm,
                    wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts
                ]);
                // Get new level ID
                levelID = result.insertId.toString();
                // Save level data to file
                const lvlPath = path_1.default.join("./data/levels", `${levelID}.dat`);
                await promises_1.default.writeFile(lvlPath, levelString);
                console_api_1.default.Log("main", `Level ${levelName} (${levelID}.dat) uploaded`);
                return levelID;
            }
        }
        else {
            console_api_1.default.Log("main", "Level could not be uploaded: levelstring and levelname are empty");
            return "-1";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.uploadLevel`);
        return "-1";
    }
};
exports.default = uploadLevel;
