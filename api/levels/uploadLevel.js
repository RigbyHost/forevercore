'package net.fimastgd.forevercore.api.levels.uploadLevel';

const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const FixIp = require("../lib/fixIp");
const GJPCheck = require("../lib/GJPCheck");
const path = require("path");
const fs = require("fs");
const c = require("ansi-colors");
const db = require("../../serverconf/db");
const settings = require("../../serverconf/settings");

const ConsoleApi = require("../../modules/console-api");

const uploadLevel = async (passwordStr, udidStr, accountIDStr, gjp2Str, gjpStr, gameVersionStr, userNameStr, levelIDStr, levelNameStr, levelDescStr, levelVersionStr, levelLengthStr, audioTrackStr, secretStr, binaryVersionStr, autoStr, originalStr, twoPlayerStr, songIDStr, objectsStr, coinsStr, requestedStarsStr, extraStringStr, levelStringStr, levelInfoStr, unlistedStr, unlisted1Str, unlisted2Str, ldmStr, wtStr, wt2Str, settingsStringStr, songIDsStr, sfxIDsStr, tsStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const _EXTRA_STRING = ["29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29"];
        const _USRDATA = req;
        let gjp2check = gjp2Str || gjpStr;
        let gjp = await ExploitPatch.remove(gjp2check);
        let gameVersion = await ExploitPatch.remove(gameVersionStr);
        let userName = await ExploitPatch.charclean(userNameStr);
        let levelID = await ExploitPatch.remove(levelIDStr);
        let levelName = await ExploitPatch.charclean(levelNameStr);
        let rawDesc;
        let parseID;
        let qa;
        let levelDesc = await ExploitPatch.remove(levelDescStr);
        if (gameVersion < 20) {
            rawDesc = levelDesc;
            levelDesc = Buffer.from(rawDesc).toString("base64");
            levelDesc = levelDesc.replace(/\+/g, "-").replace(/\//g, "_");
        } else {
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
        // TODO: сделать инициализацию параметров POST-запроса
        let levelVersion = await ExploitPatch.remove(levelVersionStr);
        let levelLength = await ExploitPatch.remove(levelLengthStr);
        let audioTrack = await ExploitPatch.remove(audioTrackStr);
        let secret = await ExploitPatch.remove(secretStr);
        // better algorythm for this
        let binaryVersion = binaryVersionStr || 0;
        let auto = autoStr || 0;
        let original = originalStr || 0;
        let twoPlayer = twoPlayerStr || 0;
        let songID = songIDStr || 0;
        let objects = objectsStr || 0;
        let coins = coinsStr || 0;
        let requestedStars = requestedStarsStr || 0;
        // old GD versions support
        let extraString = extraStringStr || _EXTRA_STRING[0];
        let levelString = levelStringStr ? await ExploitPatch.remove(levelStringStr) : "";
        // 1.9 support
        let levelInfo = levelInfoStr || "";
        // 2.2 support
        let unlistedTest = unlistedStr || 0;
        let unlisted = unlisted1Str || unlistedTest;
        let unlisted2 = unlisted2Str || unlisted;
        let ldm = ldmStr || 0;
        let wt = wtStr || 0;
        let wt2 = wt2Str || 0;
        let settingsString = settingsStringStr || "";
        let songIDs = songIDsStr || "";
        let sfxIDs = sfxIDsStr || "";
        let ts = tsStr ? await ExploitPatch.number(tsStr) : 0;
        binaryVersion = await ExploitPatch.remove(binaryVersion);
        auto = await ExploitPatch.remove(auto);
        original = await ExploitPatch.remove(original);
        twoPlayer = await ExploitPatch.remove(twoPlayer);
        songID = await ExploitPatch.remove(songID);
        objects = await ExploitPatch.remove(objects);
        coins = await ExploitPatch.remove(coins);
        requestedStars = await ExploitPatch.remove(requestedStars);
        extraString = await ExploitPatch.remove(extraString);
        levelString = await ExploitPatch.remove(levelString);
        levelInfo = await ExploitPatch.remove(levelInfo);
        unlisted = await ExploitPatch.remove(unlisted);
        unlisted2 = await ExploitPatch.remove(unlisted2);
        ldm = await ExploitPatch.remove(ldm);
        wt = await ExploitPatch.remove(wt);
        wt2 = await ExploitPatch.remove(wt2);
        settingsString = await ExploitPatch.remove(settingsString);
        songIDs = await ExploitPatch.numbercolon(songIDs);
        sfxIDs = await ExploitPatch.numbercolon(sfxIDs);
        
        // check min object limit
        if (settings.objectLimitFU === true) {
            if (settings.objectLimitCount < 5 || settings.objectLimitCount > 500) {
				ConsoleApi.FatalError("main", `Config error: settings.objectLimitCount must be more than 5 and less than 500`);
                return "-1";
            }
            if (objects < settings.objectLimitCount) {
				ConsoleApi.Log("main", `Level ${levelName} could not be uploaded by object limit`);
                return "-1";
            }
        }
        
        password = typeof passwordStr !== "undefined" ? await ExploitPatch.remove(passwordStr) : 1;
        if (gameVersion > 17) {
            password = 0;
        }
        let id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        let hostname = await FixIp.getIP(req);
        let userID = await ApiLib.getUserID(id, userName);
        let uploadDate = Math.floor(Date.now() / 1000);
        const query1 = `SELECT COUNT(*) FROM levels WHERE uploadDate > ? AND (userID = ? OR hostname = ?)`;
        const [rows] = await db.execute(query1, [uploadDate - 60, userID, hostname]);
        if (rows[0]["COUNT(*)"] > 0) {
            return "-1";
        }

        /*const query2 = `
    INSERT INTO levels
    (levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack, auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, secret, uploadDate, userID, extID, updateDate, unlisted, hostname, isLDM, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;*/
        const query2 = `
    INSERT INTO levels
    (levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack, auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, secret, uploadDate, userID, extID, updateDate, unlisted, hostname, isLDM, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

        /*await db.execute(query2, [
    levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion,
    levelLength, audioTrack, auto, password, original, twoPlayer, songID,
    objects, coins, requestedStars, extraString, levelString, levelInfo,
    secret, uploadDate, userID, id, uploadDate, unlisted, hostname, ldm,
    wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts,
  ]);*/

        if (levelString != "" && levelName != "") {
            const [rowse] = await db.query("SELECT levelID FROM levels WHERE levelName = ? AND userID = ?", [levelName, userID]);
            levelID = rowse[0]?.levelID;
            const lvls = rowse.length;
            if (lvls == 1) {
                qa = `
  UPDATE levels
  SET levelName = ?, gameVersion = ?, binaryVersion = ?, userName = ?,
      levelDesc = ?, levelVersion = ?, levelLength = ?, audioTrack = ?,
      auto = ?, password = ?, original = ?, twoPlayer = ?, songID = ?,
      objects = ?, coins = ?, requestedStars = ?, extraString = ?,
      levelString = ?, levelInfo = ?, secret = ?, updateDate = ?,
      unlisted = ?, hostname = ?, isLDM = ?, wt = ?, wt2 = ?,
      unlisted2 = ?, settingsString = ?, songIDs = ?, sfxIDs = ?, ts = ?
  WHERE levelName = ? AND extID = ?`;
                const [rowsa, fieldsa] = await db.execute(qa, [levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack, auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, secret, uploadDate, unlisted, hostname, ldm, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts, levelName, id]);
                levelID = levelID.toString();
                const lvlPath1 = path.join("./data/levels", `${levelID}.dat`);
                await fs.promises.writeFile(lvlPath1, levelString);
                parseID = levelID.toString();
                return parseID;
            } else {
                /* const debugArr = [levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack, auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, secret, uploadDate, userID, id, uploadDate, unlisted, hostname, ldm, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts];
                for (let i2 = 0; i2 < 34; i2++) {
                    console.log(`[${i2}]: ${debugArr[i2]}`);
                } */
                const [rowsb] = await db.execute(query2, [levelName, gameVersion, binaryVersion, userName, levelDesc, levelVersion, levelLength, audioTrack, auto, password, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, secret, uploadDate, userID, id, uploadDate, unlisted, hostname, ldm, wt, wt2, unlisted2, settingsString, songIDs, sfxIDs, ts]);
                levelID = rowsb.insertId;
                levelID = levelID.toString();
                const lvlPath2 = path.join("./data/levels", `${levelID}.dat`);
                await fs.promises.writeFile(lvlPath2, levelString);
                parseID = levelID.toString();
                ConsoleApi.Log("main", `Level ${levelName} (${levelID}.dat) uploaded`);
                return parseID;
            }
        } else {
			ConsoleApi.Log("main", `Level could not be uploaded: levelstring and levelname are empty`);
            return "-1";
        }
    } catch (error) {
        //let error = error.split(/\bfs\b/).join("module \"File System\"");
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.uploadLevel`);
        return "-1";
    }
};

module.exports = uploadLevel;
