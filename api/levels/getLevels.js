'package net.fimastgd.forevercore.api.levels.getLevels';

const db = require("../../serverconf/db");
const ApiLib = require("../lib/apiLib");
const GeneratePass = require("../lib/generatePass");
const GenerateHash = require("../lib/generateHash");
const GJPCheck = require("../lib/GJPCheck");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getLevels = async (gameVersionStr, binaryVersionStr, typeStr, diffStr, uncompletedStr, originalStr, coinsStr, completedLvlsStr, onlyCompletedStr, songStr, customSongStr, twoPlayerStr, starStr, noStarStr, gauntletStr, lenStr, featuredStr, epicStr, mythicStr, legendaryStr, demonFilterStr, strStr, pageStr, followedStr, accountIDStr, gjpStr, gjp2Str, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        var lvlstring = "";
        var userstring = "";
        var songsstring = "";
        var lvlsmultistring = [];
        var epicParams = [];
        var str = "";
        var order = "uploadDate";
        var orderenabled = true;
        var ordergauntlet = false;
        var isIDSearch = false;
        var params = ["unlisted = 0"];
        var morejoins = "";
        var gameVersion, binaryVersion, type, diff;
        var completedLevels, song, gauntlet, epicFilter;
        var offset, uploadDate, followed, accountID, peoplearray, whereor;
        var listLevels, totallvlcount;
        var sug = "",
            sugg = "";
        var countquery;

        if (gameVersionStr) {
            gameVersion = parseInt(gameVersionStr);
        } else {
            gameVersion = 0;
        }
        if (isNaN(gameVersion)) {
            return "-1";
        }
        if (gameVersion == 20) {
            binaryVersion = parseInt(binaryVersionStr);
            if (binaryVersion > 27) {
                gameVersion++;
            }
        }
        if (typeStr) {
            type = parseInt(typeStr);
        } else {
            type = 0;
        }

        if (diffStr) {
            // ROBERT LOPATA MOMENT
            if (Array.isArray(diffStr)) {
                // ConsoleApi.Warn("main", `Array instead of Int detected, trying to offset array...`);
                diff = diffStr[0];
            } else {
                diff = diffStr;
            }
        } else {
            diff = "-";
        }
        if (diff == "") {
            diff = "-";
        }
        if (gameVersion == 0) {
            params.push("levels.gameVersion <= 18");
        } else {
            params.push(`levels.gameVersion <= ${gameVersion}`);
        }
        if (originalStr && originalStr == "1") {
            params.push("original = 0");
        }
        if (coinsStr && coinsStr == "1") {
            params.push("starCoins = 1 AND NOT levels.coins = 0");
        }
        if (uncompletedStr && uncompletedStr == "1") {
            completedLevels = await ExploitPatch.numbercolon(completedLevelsStr);
            params.push(`NOT levelID IN (${completedLevels})`);
        }
        if (onlyCompletedStr && onlyCompletedStr == "1") {
            completedLevels = await ExploitPatch.numbercolon(completedLevelsStr);
            params.push(`levelID IN (${completedLevels})`);
        }
        if (songStr) {
            if (!customSongStr) {
                song = (await ExploitPatch.number(songStr)) - 1;
                params.push(`audioTrack = ${song} AND songID = 0`);
            } else {
                song = await ExploitPatch.number(songStr);
                params.push(`songID = ${song}`);
            }
        }
        if (twoPlayerStr == 1) {
            params.push("twoPlayer = 1");
        }
        if (starStr) {
            params.push("NOT starStars = 0");
        }
        if (noStarStr) {
            params.push("starStars = 0");
        }

        if (gauntletStr) {
            gauntlet = await ExploitPatch.remove(gauntletStr);
            const [rows] = await db.execute("SELECT * FROM gauntlets WHERE ID = ?", [gauntlet]);
            const actualgauntlet = rows[0];
            str = `${actualgauntlet.level1},${actualgauntlet.level2},${actualgauntlet.level3},${actualgauntlet.level4},${actualgauntlet.level5}`;
            params.push(`levelID IN (${str})`);
            type = -1;
        }
        len = lenStr ? await ExploitPatch.numbercolon(lenStr) : "-";
        if (len != "-" && len) {
            params.push(`levelLength IN (${len})`);
        }
        if (featuredStr != 0 && typeof featuredStr !== "undefined") epicParams.push("starFeatured = 1");
        if (epicStr != "" && typeof epicStr !== "undefined") epicParams.push("starEpic = 1");
        if (mythicStr != "" && typeof mythicStr !== "undefined") epicParams.push("starEpic = 2");
        if (legendaryStr != "" && typeof legendaryStr !== "undefined") epicParams.push("starEpic = 3");
        epicFilter = epicParams.join(" OR ");
        if (epicFilter != "" && epicFilter) params.push(epicFilter);
        switch (diff) {
            case -1:
                params.push("starDifficulty = '0'");
                break;
            case -3:
                params.push("starAuto = '1'");
                break;
            case -2:
                if (demonFilterStr) {
                    const demonFilter = parseInt(demonFilterStr);
                    params.push("starDemon = 1");
                    switch (demonFilter) {
                        case 1:
                            params.push("starDemonDiff = '3'");
                            break;
                        case 2:
                            params.push("starDemonDiff = '4'");
                            break;
                        case 3:
                            params.push("starDemonDiff = '0'");
                            break;
                        case 4:
                            params.push("starDemonDiff = '5'");
                            break;
                        case 5:
                            params.push("starDemonDiff = '6'");
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "-":
                break;
            default:
                if (diff) {
                    var diffString = diff.toString();
                    diff = diffString.replace(/,/g, "0,") + "0";
                    params.push(`starDifficulty IN (${diff}) AND starAuto = '0' AND starDemon = '0'`);
                }
                break;
        }
        if (strStr != "" && strStr) {
            str = await ExploitPatch.remove(strStr);
        }
        if (pageStr && !isNaN(pageStr)) {
            var patch = await ExploitPatch.number(pageStr);
            offset = `${patch}0`;
        } else {
            offset = 0;
        }

        switch (type) {
            case 0:
            case 15:
                order = "likes";
                if (str != "" && str) {
                    if (!isNaN(str)) {
                        params = [`levelID = '${str}'`];
                    } else {
                        params = [`levelName LIKE '%${str}%'`];
                    }
                }
                break;
            case 1:
                order = "downloads";
                break;
            case 2:
                order = "likes";
                break;
            case 3: // TRENDING
                uploadDate = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
                params.push(`uploadDate > ${uploadDate}`);
                order = "likes";
                break;
            case 5:
                params.push(`levels.userID = '${str}'`);
                break;
            case 6: // FEATURED
            case 17: // FEATURED DWE
                if (gameVersion > 21) {
                    params.push(`NOT starFeatured = 0 OR NOT starEpic = 0`);
                } else {
                    params.push(`NOT starFeatured = 0`);
                }
                order = "rateDate DESC,uploadDate";
                break;
            case 16: // HALL OF FAME
                params.push(`NOT starEpic = 0 `);
                order = "rateDate DESC,uploadDate";
            case 7: // MAGIC
                params.push(`objects > 9999`);
                break;
            case 10: // MAP PACKS
            case 19:
                order = false;
                params.push(`levelID IN (${str})`);
                break;
            case 11: // AWARDED
                params.push(`NOT starStars = 0`);
                order = "rateDate DESC,uploadDate";
                break;
            case 12: // FOLLOWED
                followed = ExploitPatch.numbercolon(followedStr);
                params.push(`users.extID IN (${followed})`);
                break;
            case 13: // FRIENDS
                accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
                peoplearray = await ApiLib.getFriends(accountID);
                whereor = peoplearray.join(",");
                params.push(`users.extID IN (${whereor})`);
                break;
            case 21: // DAILY SAFE
                morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
                params.push(`dailyfeatures.type = 0`);
                order = "dailyfeatures.feaID";
                break;
            case 22: // WEEKLY SAFE
                morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
                params.push(`dailyfeatures.type = 1`);
                order = "dailyfeatures.feaID";
                break;
            case 23: // EVENT SAFE (assumption)
                morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
                params.push(`dailyfeatures.type = 2`);
                order = "dailyfeatures.feaID";
                break;
            case 25: // LIST LEVELS
                listLevels = await ApiLib.getListLevels(str);
                params = [`levelID IN (${listLevels})`];
                break;
            case 27: // SENT FOR RATE LEVELS
                sug = ", suggest.suggestLevelId, suggest.timestamp";
                sugg = "LEFT JOIN suggest ON levels.levelID = suggest.suggestLevelId";
                params.push("suggestLevelId > 0");
                order = "suggest.timestamp";
                break;
        }

        var querybase = `
        FROM levels
        LEFT JOIN songs ON levels.songID = songs.ID
        LEFT JOIN users ON levels.userID = users.userID
        ${sugg} ${morejoins}
    `;

        if (params.length > 0) {
            querybase += ` WHERE (${params.join(") AND (")})`;
        }

        var query = `
        SELECT levels.*, songs.ID, songs.name, songs.authorID, songs.authorName,
        songs.size, songs.isDisabled, songs.download, users.userName, users.extID
        ${querybase}
    `;

        if (order) {
            query += ordergauntlet ? ` ORDER BY ${order} ASC` : ` ORDER BY ${order} DESC`;
        }
        query += ` LIMIT 10 OFFSET ${offset}`;
        countquery = `SELECT count(*) ${querybase}`;
        const [countResult] = await db.query(countquery);
        totallvlcount = countResult[0]["count(*)"];

        //const query = db.prepare(querybase); # i'm stupid
        const [result] = await db.execute(query);
        const levelcount = result.length;

        for (const level1 of result) {
            if (level1["levelID"]) {
                if (isIDSearch && level1["unlisted"] > 1) {
                    if (!accountID) accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
                    if (!(await ApiLib.isFriends(accountID, level1["extID"])) && accountID != level1["extID"]) break;
                }
                lvlsmultistring.push({
                    levelID: level1["levelID"],
                    stars: level1["starStars"],
                    coins: level1["starCoins"]
                });

                if (gauntlet) {
                    lvlstring += `44:${gauntlet}:`;
                }

                lvlstring += `1:${level1["levelID"]}:2:${level1["levelName"]}:5:${level1["levelVersion"]}:6:${level1["userID"]}:8:10:9:${level1["starDifficulty"]}:10:${level1["downloads"]}:12:${level1["audioTrack"]}:13:${level1["gameVersion"]}:14:${level1["likes"]}:17:${level1["starDemon"]}:43:${level1["starDemonDiff"]}:25:${level1["starAuto"]}:18:${level1["starStars"]}:19:${level1["starFeatured"]}:42:${level1["starEpic"]}:45:${level1["objects"]}:3:${level1["levelDesc"]}:15:${level1["levelLength"]}:30:${level1["original"]}:31:${level1["twoPlayer"]}:37:${level1["coins"]}:38:${level1["starCoins"]}:39:${level1["requestedStars"]}:46:1:47:2:40:${level1["isLDM"]}:35:${level1["songID"]}|`;

                if (level1["songID"] !== 0) {
                    song = await ApiLib.getSongString(level1);
                    if (song) {
                        songsstring += `${song}~:~`;
                    }
                }

                userstring += (await ApiLib.getUserString(level1)) + "|";
            }
        }

        lvlstring = lvlstring.slice(0, -1);
        userstring = userstring.slice(0, -1);
        songsstring = songsstring.slice(0, -3);
        var resultFN = `${lvlstring}#${userstring}`;

        if (gameVersion > 18) {
            resultFN += `#${songsstring}`;
        }

        resultFN += `#${totallvlcount}:${offset}:10#`;
        resultFN += await GenerateHash.genMulti(lvlsmultistring);
        resultFN = resultFN.toString(); // для неожиданных моментов
        ConsoleApi.Log("main", "Received levels by accountID: " + accountIDStr);
        return resultFN;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.getLevels`);
    }
};

module.exports = getLevels;
