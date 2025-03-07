'package net.fimastgd.forevercore.api.levels.downloadLevel';

const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const GenerateHash = require("../lib/generateHash");
const XORCipher = require("../lib/XORCipher");
const FixIp = require("../lib/fixIp");
const fs = require("fs");
const path = require("path");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const downloadLevel = async (accountIDStr, gjp2Str, gjpStr, gameVersionStr, levelIDStr, extrasStr, incStr, binaryVersionStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        // я использую "var" вместо "let" и "const" для глобальной области видимости переменных
        var gameVersion = gameVersionStr ? await ExploitPatch.remove(gameVersionStr) : 1;
        if (!levelIDStr) {
            return "-1";
        }
        var extras = extrasStr == "1";
        var inc = incStr == "1";
        var ip = await FixIp.getIP(req);
        let levelID = await ExploitPatch.remove(levelIDStr);
        var binaryVersion = binaryVersionStr ? await ExploitPatch.remove(levelIDStr) : 0;
        var feaID = 0;

        if (isNaN(levelID)) {
            return "-1";
        }

        var daily = 0;
        var query;
        let query25;
        var result;
		const ldswtch = levelID.toString();
        switch (ldswtch) {
            case "-1": // Daily level
                query25 = "SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 0 ORDER BY timestamp DESC LIMIT 1";
                const [result25] = await db.query(query25, [Math.floor(Date.now() / 1000)]);
                // result = await db.execute(query25, [999999999999999]);
                levelID = result25[0].levelID;
                feaID = result25[0].feaID;
                daily = 1;
                levelID = levelID.toString();
                break;
            case "-2": // Weekly level
                query25 = "SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 1 ORDER BY timestamp DESC LIMIT 1";
                const [result26] = await db.query(query, [Math.floor(Date.now() / 1000)]);
                levelID = result26[0].levelID;
                levelID = levelID.toString();
                feaID = result26[0].feaID;
                feaID = feaID + 100001;
                daily = 1;
                break;
            case "-3": // Event level (may be?)
                query25 = "SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 2 ORDER BY timestamp DESC LIMIT 1";
                [result27] = await db.query(query, [Math.floor(Date.now() / 1000)]);
                levelID = result27[0].levelID;
                levelID = levelID.toString();
                feaID = result27[0].feaID;
                daily = 1;
                break;
        }

        // Загрузка уровня
        if (daily == 1) {
            query = "SELECT levels.*, users.userName, users.extID FROM levels LEFT JOIN users ON levels.userID = users.userID WHERE levelID = ?";
        } else {
            query = "SELECT * FROM levels WHERE levelID = ?";
        }
        result = await db.execute(query, [levelID]);
        var lvls = result[0].length;

        if (lvls != 0) {
            var level = result[0][0];
            //var level = result[0];

            // уровни Friends Only
            if (level.unlisted2 != 0) {
                var accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
                if (!(level.extID == accountID || (await ApiLib.isFriends(accountID, level.extID)))) {
                    return "-1";
                }
            }
            if (inc) {
                query = "SELECT count(*) as count FROM actions_downloads WHERE levelID=? AND ip=INET6_ATON(?)";
                result = await db.execute(query, [levelID, ip]);
                if (result[0][0].count < 2) {
                    await db.execute("UPDATE levels SET downloads = downloads + 1 WHERE levelID = ?", [levelID]);
                    await db.execute("INSERT INTO actions_downloads (levelID, ip) VALUES (?,INET6_ATON(?))", [levelID, ip]);
                }
            }

             // var uploadDateExt = new Date(level.uploadDate * 1000).toLocaleString("en-GB").replace(",", "");
             // var updateDateExt = new Date(level.updateDate * 1000).toLocaleString("en-GB").replace(",", "");
             var updateDateExt = new Date(level.updateDate * 1000);
             var uploadDateExt = new Date(level.uploadDate * 1000);
            var options = {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            };
            var uploadDate = uploadDateExt.toLocaleString("ru-RU", options);
            var updateDate = updateDateExt.toLocaleString("ru-RU", options);

            uploadDate = uploadDate.replace(/:/g, "-");
            updateDate = updateDate.replace(/:/g, "-");
            uploadDate = uploadDate.replace(/,/g, "");
            updateDate = updateDate.replace(/,/g, "");
            uploadDate = uploadDate.replace(/\./g, "-");
            updateDate = updateDate.replace(/\./g, "-");


            var pass = level.password;
            var desc = level.levelDesc;

            if ((await ApiLib.checkModIPPermission("actionFreeCopy", req)) == 1) {
                pass = "1";
            }

            var xorPass = pass;
            if (gameVersion > 19) {
                if (pass != 0) xorPass = Buffer.from(XORCipher.cipher(pass, 26364)).toString("base64");
            } else {
                desc = await ExploitPatch.remove(Buffer.from(desc, "base64").toString());
            }

            var levelstring;
            const LEVEL_PATH = await path.join("./data/levels", `${levelID}.dat`);
            if (fs.existsSync(LEVEL_PATH)) {
                levelstring = fs.readFileSync(LEVEL_PATH, "utf8");
            } else {
                levelstring = level.levelString;
            }
            if (gameVersion > 18) {
                if (levelstring.substring(0, 3) == "kS1") {
                    levelstring = Buffer.from(require("zlib").gzipSync(levelstring)).toString("base64");
                    levelstring = levelstring.replace(/\//g, "_").replace(/\+/g, "-");
                }
            }

            var response = `1:${level.levelID}:2:${level.levelName}:3:${desc}:4:${levelstring}:5:${level.levelVersion}:6:${level.userID}:8:10:9:${level.starDifficulty}:10:${level.downloads}:11:1:12:${level.audioTrack}:13:${level.gameVersion}:14:${level.likes}:17:${level.starDemon}:43:${level.starDemonDiff}:25:${level.starAuto}:18:${level.starStars}:19:${level.starFeatured}:42:${level.starEpic}:45:${level.objects}:15:${level.levelLength}:30:${level.original}:31:${level.twoPlayer}:28:${uploadDate}:29:${updateDate}:35:${level.songID}:36:${level.extraString}:37:${level.coins}:38:${level.starCoins}:39:${level.requestedStars}:46:${level.wt}:47:${level.wt2}:48:${level.settingsString}:40:${level.isLDM}:27:${xorPass}:52:${level.songIDs}:53:${level.sfxIDs}:57:${level.ts}`;

            if (daily == 1) response += `:41:${feaID}`;
            if (extras) response += `:26:${level.levelInfo}`;

            response += `#${await GenerateHash.genSolo(levelstring)}#`;

            var somestring = `${level.userID},${level.starStars},${level.starDemon},${level.levelID},${level.starCoins},${level.starFeatured},${pass},${feaID}`;
            response += await GenerateHash.genSolo2(somestring);

            if (daily == 1) {
                response += `#${await ApiLib.getUserString(level)}`;
            } else if (binaryVersion == 30) {
                response += `#${somestring}`;
            }
            ConsoleApi.Log("main", `Downloaded level ${levelID}.dat`);
            return response;
        } else {
            return "-1";
        }
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.downloadLevel`);
        return "-1";
    }
};

module.exports = downloadLevel;
