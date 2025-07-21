'package net.fimastgd.forevercore.api.packs.lists.getLists';
const db = require("../../../serverconf/db");
const ExploitPatch = require("../../lib/exploitPatch");
const ApiLib = require("../../lib/apiLib");
const GJPCheck = require("../../lib/GJPCheck");
const FixIp = require("../../lib/fixIp");
const c = require("ansi-colors");
const ConsoleApi = require("../../../modules/console-api");
const getLists = async (req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        let lvlstring = "";
        let userstring = "";
        let songsstring = "";
        let lvlsmultistring = [];
        let str = "";
        let order = "uploadDate";
        let morejoins = "";
        const type = req.body.type ? (await ExploitPatch.number(req.body.type)) : 0;
        const diff = req.body.diff ? (await ExploitPatch.numbercolon(req.body.diff)) : "-";
        const demonFilter = req.body.demonFilter ? (await ExploitPatch.number(req.body.demonFilter)) : 0;
        // ADDITIONAL PARAMETERS
        const params = [];
        if (req.body.star || (req.body.featured && req.body.featured == 1)) {
            params.push("NOT starStars = 0");
        }
        // DIFFICULTY FILTERS
        switch (diff.toString()) {
            case "-1":
                params.push("starDifficulty = '-1'");
                break;
            case "-3":
                params.push("starDifficulty = '0'");
                break;
            case "-2":
                params.push(`starDifficulty = 5+${demonFilter}`);
                break;
            case "-":
                break;
            default:
                if (diff) {
                    params.push(`starDifficulty IN (${diff})`);
                }
                break;
        }
        // TYPE DETECTION
        if (req.body.str) {
            str = await ExploitPatch.remove(req.body.str);
        }
        const offset = req.body.page && !isNaN(req.body.page) ? ((await ExploitPatch.number(req.body.page)) + "0") : 0;
        params.push("unlisted = 0");
        switch (parseInt(type)) {
            case 0:
                order = "likes";
                if (str) {
                    if (!isNaN(str)) {
                        params.push(`listID = '${str}'`);
                    }
                    else {
                        params.push(`listName LIKE '%${str}%'`);
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
                order = "downloads";
                params.push(`lists.uploadDate > ${Date.now() / 1000 - 604800}`);
                break;
            case 4: // RECENT
                order = "uploadDate";
                break;
            case 5:
                params.push(`lists.accountID = '${str}'`);
                break;
            case 6: // TOP LISTS
                params.push("lists.starStars > 0");
                params.push("lists.starFeatured > 0");
                order = "downloads";
                break;
            case 11: // RATED
                params.push("lists.starStars > 0");
                order = "downloads";
                break;
            case 12: //FOLLOWED
                const followed = await ExploitPatch.numbercolon(req.body.followed) || 0;
                params.push(`lists.accountID IN (${followed})`);
                break;
            case 13: //FRIENDS
                const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
                const peoplearray = await ApiLib.getFriends(accountID);
                const whereor = peoplearray.join(",");
                params.push(`lists.accountID IN (${whereor})`);
                break;
            case 7: // MAGIC
            case 27: // SENT
                params.push("suggest.suggestLevelId < 0");
                order = "suggest.timestamp";
                morejoins = "LEFT JOIN suggest ON lists.listID*-1 LIKE suggest.suggestLevelId";
                break;
        }
        // ACTUAL QUERY EXECUTION
        let querybase = `FROM lists LEFT JOIN users ON lists.accountID LIKE users.extID ${morejoins}`;
        if (params.length > 0) {
            querybase += ` WHERE (${params.join(") AND (")})`;
        }
        const query = `SELECT lists.*, UNIX_TIMESTAMP(uploadDate) AS uploadDateUnix, UNIX_TIMESTAMP(updateDate) AS updateDateUnix, users.userID, users.userName, users.extID ${querybase}`;
        const finalQuery = order ? `${query} ORDER BY ${order} DESC` : query;
        const limitedQuery = `${finalQuery} LIMIT 10 OFFSET ${offset}`;
        const countQuery = `SELECT count(*) ${querybase}`;
        const [results, countResults] = await Promise.all([
            db.query(limitedQuery),
            db.query(countQuery)
        ]);
        const totallvlcount = countResults[0][0]['count(*)'];
        const result = results[0];
        const levelcount = result.length;
        for (const list of result) {
            if (!list.uploadDateUnix)
                list.uploadDateUnix = 0;
            if (!list.updateDateUnix)
                list.updateDateUnix = 0;
            lvlstring += `1:${list.listID}:2:${list.listName}:3:${list.listDesc}:5:${list.listVersion}:49:${list.accountID}:50:${list.userName}:10:${list.downloads}:7:${list.starDifficulty}:14:${list.likes}:19:${list.starFeatured}:51:${list.listlevels}:55:${list.starStars}:56:${list.countForReward}:28:${list.uploadDateUnix}:29:${list.updateDateUnix}|`;
            userstring += `${await ApiLib.getUserString(list)}|`;
        }
        if (!lvlstring)
            return "-1";
        if (str && !isNaN(str) && levelcount == 1) {
            const ip = await FixIp.getIP(req);
            const [downloadCount] = await db.query("SELECT count(*) FROM actions_downloads WHERE levelID = ? AND ip = INET6_ATON(?)", [`-${str}`, ip]);
            if (downloadCount[0]['count(*)'] < 2) {
                await db.query("UPDATE lists SET downloads = downloads + 1 WHERE listID = ?", [str]);
                await db.query("INSERT INTO actions_downloads (levelID, ip) VALUES (?, INET6_ATON(?))", [`-${str}`, ip]);
            }
        }
        lvlstring = lvlstring.slice(0, -1);
        userstring = userstring.slice(0, -1);
        // no comments
        const STOP_SMOKIMG = "Sa1ntSosetHuiHelloFromGreenCatsServerLOL"; // без этого не работает. 
        ConsoleApi.Log("main", "Received lists chunks");
        return `${lvlstring}#${userstring}#${totallvlcount}:${offset}:10#${STOP_SMOKIMG}`;
    }
    catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.getLists`);
        return "-1";
    }
};
module.exports = getLists;
