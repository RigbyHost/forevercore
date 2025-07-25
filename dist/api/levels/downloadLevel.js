'package net.fimastgd.forevercore.api.levels.downloadLevel';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const generateHash_1 = __importDefault(require("../lib/generateHash"));
const XORCipher_1 = __importDefault(require("../lib/XORCipher"));
const fixIp_1 = __importDefault(require("../lib/fixIp"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Handles downloading a level
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param gameVersionStr - Game version
 * @param levelIDStr - Level ID
 * @param extrasStr - Extras flag
 * @param incStr - Increment downloads flag
 * @param binaryVersionStr - Binary version
 * @param req - Express request
 * @returns Download response string
 */
const downloadLevel = async (accountIDStr, gjp2Str, gjpStr, gameVersionStr, levelIDStr, extrasStr, incStr, binaryVersionStr, req) => {
    try {
        // Parse and validate input parameters
        const gameVersion = gameVersionStr ? parseInt(await exploitPatch_1.default.remove(gameVersionStr)) : 1;
        if (!levelIDStr) {
            return "-1";
        }
        const extras = extrasStr === "1";
        const inc = incStr === "1";
        const ip = req ? await fixIp_1.default.getIP(req) : '';
        let levelID = await exploitPatch_1.default.remove(levelIDStr);
        const binaryVersion = binaryVersionStr ? parseInt(await exploitPatch_1.default.remove(binaryVersionStr)) : 0;
        if (isNaN(parseInt(levelID))) {
            return "-1";
        }
        // Handle special level IDs
        let daily = 0;
        let feaID = 0;
        switch (levelID) {
            case "-1": // Daily level
                const [result25] = await db_proxy_1.default.execute("SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 0 ORDER BY timestamp DESC LIMIT 1", [Math.floor(Date.now() / 1000)]);
                if (result25.length === 0)
                    return "-1";
                levelID = result25[0].levelID.toString();
                feaID = result25[0].feaID;
                daily = 1;
                break;
            case "-2": // Weekly level
                const [result26] = await db_proxy_1.default.execute("SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 1 ORDER BY timestamp DESC LIMIT 1", [Math.floor(Date.now() / 1000)]);
                if (result26.length === 0)
                    return "-1";
                levelID = result26[0].levelID.toString();
                feaID = result26[0].feaID + 100001;
                daily = 1;
                break;
            case "-3": // Event level
                const [result27] = await db_proxy_1.default.execute("SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 2 ORDER BY timestamp DESC LIMIT 1", [Math.floor(Date.now() / 1000)]);
                if (result27.length === 0)
                    return "-1";
                levelID = result27[0].levelID.toString();
                feaID = result27[0].feaID;
                daily = 1;
                break;
        }
        // Get level data
        const query = daily === 1
            ? "SELECT levels.*, users.userName, users.extID FROM levels LEFT JOIN users ON levels.userID = users.userID WHERE levelID = ?"
            : "SELECT * FROM levels WHERE levelID = ?";
        const [rows] = await db_proxy_1.default.execute(query, [levelID]);
        if (rows.length === 0) {
            return "-1";
        }
        const level = rows[0];
        // Check if user has access to the level
        if (level.unlisted2 !== 0) {
            const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
            if (!(level.extID === accountID || (await apiLib_1.default.isFriends(accountID, level.extID)))) {
                return "-1";
            }
        }
        // Increment download count if requested
        if (inc) {
            const [downloadCount] = await db_proxy_1.default.execute("SELECT count(*) as count FROM actions_downloads WHERE levelID = ? AND ip = INET6_ATON(?)", [levelID, ip]);
            if (downloadCount[0].count < 2) {
                await db_proxy_1.default.execute("UPDATE levels SET downloads = downloads + 1 WHERE levelID = ?", [levelID]);
                await db_proxy_1.default.execute("INSERT INTO actions_downloads (levelID, ip) VALUES (?, INET6_ATON(?))", [levelID, ip]);
            }
        }
        // Format dates
        const uploadDateObj = new Date(level.uploadDate * 1000);
        const updateDateObj = new Date(level.updateDate * 1000);
        const dateOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        };
        let uploadDate = uploadDateObj.toLocaleString("ru-RU", dateOptions)
            .replace(/:/g, "-")
            .replace(/,/g, "")
            .replace(/\./g, "-");
        let updateDate = updateDateObj.toLocaleString("ru-RU", dateOptions)
            .replace(/:/g, "-")
            .replace(/,/g, "")
            .replace(/\./g, "-");
        // Process password
        let pass = level.password;
        let desc = level.levelDesc;
        if ((await apiLib_1.default.checkPermission(parseInt(accountIDStr), "actionFreeCopy")) === true) {
            pass = "1";
        }
        // XOR password for newer game versions
        let xorPass = pass;
        if (gameVersion > 19) {
            if (pass !== "0") {
                xorPass = Buffer.from(await XORCipher_1.default.cipher(pass, 26364)).toString("base64");
            }
        }
        else {
            desc = await exploitPatch_1.default.remove(Buffer.from(desc, "base64").toString());
        }
        // Get level string from file or database
        let levelString;
        const levelPath = path_1.default.join("./data/levels", `${levelID}.dat`);
        if ((0, fs_1.existsSync)(levelPath)) {
            levelString = await fs_1.promises.readFile(levelPath, "utf8");
        }
        else {
            levelString = level.levelString;
        }
        // Compress level string for newer game versions
        if (gameVersion > 18) {
            if (levelString.substring(0, 3) === "kS1") {
                levelString = Buffer.from(zlib_1.default.gzipSync(levelString)).toString("base64")
                    .replace(/\//g, "_")
                    .replace(/\+/g, "-");
            }
        }
        // Build response
        let response = [
            `1:${level.levelID}`,
            `2:${level.levelName}`,
            `3:${desc}`,
            `4:${levelString}`,
            `5:${level.levelVersion}`,
            `6:${level.userID}`,
            `8:10`,
            `9:${level.starDifficulty}`,
            `10:${level.downloads}`,
            `11:1`,
            `12:${level.audioTrack}`,
            `13:${level.gameVersion}`,
            `14:${level.likes}`,
            `17:${level.starDemon}`,
            `43:${level.starDemonDiff}`,
            `25:${level.starAuto}`,
            `18:${level.starStars}`,
            `19:${level.starFeatured}`,
            `42:${level.starEpic}`,
            `45:${level.objects}`,
            `15:${level.levelLength}`,
            `30:${level.original}`,
            `31:${level.twoPlayer}`,
            `28:${uploadDate}`,
            `29:${updateDate}`,
            `35:${level.songID}`,
            `36:${level.extraString}`,
            `37:${level.coins}`,
            `38:${level.starCoins}`,
            `39:${level.requestedStars}`,
            `46:${level.wt}`,
            `47:${level.wt2}`,
            `48:${level.settingsString}`,
            `40:${level.isLDM}`,
            `27:${xorPass}`,
            `52:${level.songIDs || ''}`,
            `53:${level.sfxIDs || ''}`,
            `57:${level.ts}`
        ].join(":");
        // Add feature ID for daily levels
        if (daily === 1) {
            response += `:41:${feaID}`;
        }
        // Add extra info if requested
        if (extras) {
            response += `:26:${level.levelInfo}`;
        }
        // Add hashes and additional data
        const levelStringHash = await generateHash_1.default.genSolo(levelString);
        response += `#${levelStringHash}#`;
        const hashData = `${level.userID},${level.starStars},${level.starDemon},${level.levelID},${level.starCoins},${level.starFeatured},${pass},${feaID}`;
        const secondHash = await generateHash_1.default.genSolo2(hashData);
        response += secondHash;
        // Add user data for daily levels or binary version 30
        if (daily === 1) {
            response += `#${await apiLib_1.default.getUserString(level)}`;
        }
        else if (binaryVersion === 30) {
            response += `#${hashData}`;
        }
        console_api_1.default.Log("main", `Downloaded level ${levelID}.dat`);
        return response;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.downloadLevel`);
        return "-1";
    }
};
exports.default = downloadLevel;
