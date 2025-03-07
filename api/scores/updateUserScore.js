'package net.fimastgd.forevercore.api.scores.updateUserScore';

const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const updateUserScore = async (accountIDStr, userNameStr, secretStr, starsStr, demonsStr, iconStr, color1Str, color2Str, gameVersionStr, binaryVersionStr, coinsStr, iconTypeStr, userCoinsStr, specialStr, accIconStr, accShipStr, accBallStr, accBirdStr, accDartStr, accRobotStr, accGlowStr, accSpiderStr, accExplosionStr, diamondsStr, moonsStr, color3Str, accSwingStr, accJetpackStr, dinfoStr, dinfowStr, dinfogStr, sinfoStr, sinfodStr, sinfogStr, udidStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
	    if (!userNameStr || !secretStr || !starsStr || !demonsStr || !iconStr || !color1Str || !color2Str) {
			ConsoleApi.Log("main", `Failed to update user score ${userNameStr} (accountID: ${accountIDStr}): needed params not found`);
	        return "-1";
	    }
	    let userName = ExploitPatch.charclean(userNameStr);
	    let secret = ExploitPatch.remove(secretStr);
	    let stars = ExploitPatch.remove(starsStr);
	    let demons = ExploitPatch.remove(demonsStr);
	    let icon = ExploitPatch.remove(iconStr);
	    let color1 = ExploitPatch.remove(color1Str);
	    let color2 = ExploitPatch.remove(color2Str);
	
		// JOPA
	    let gameVersionW = gameVersionStr || 1;
	    let binaryVersionW = binaryVersionStr || 1;
	    let coinsW = coinsStr || 0;
	    let iconTypeW = iconTypeStr || 0;
	    let userCoinsW = userCoinsStr || 0;
	    let specialW = specialStr || 0;
	    let accIconW = accIconStr || 0;
	    let accShipW = accShipStr || 0;
	    let accBallW = accBallStr || 0;
	    let accBirdW = accBirdStr || 0;
	    let accDartW = accDartStr || 0;
	    let accRobotW = accRobotStr || 0;
	    let accGlowW = accGlowStr || 0;
	    let accSpiderW = accSpiderStr || 0;
	    let accExplosionW = accExplosionStr || 0;
	    let diamondsW = diamondsStr || 0;
	    let moonsW = moonsStr || 0;
	    let color3W = color3Str || 0;
	    let accSwingW = accSwingStr || 0;
	    let accJetpackW = accJetpackStr || 0;
	    let dinfoW = dinfoStr || "";
	    let dinfowW = dinfowStr || 0;
	    let dinfogW = dinfogStr || 0;
	    let sinfoW = sinfoStr || "";
	    let sinfodW = sinfodStr || 0;
	    let sinfogW = sinfogStr || 0;
	
	    //console.log(userNameStr, secretStr, starsStr, demonsStr, iconStr, color1Str, color2Str, gameVersionStr, binaryVersionStr, coinsStr, iconTypeStr, userCoinsStr, specialStr, accIconStr, accShipStr, accBallStr, accBirdStr, accDartStr, accRobotStr, accGlowStr, accSpiderStr, accExplosionStr, diamondsStr, moonsStr, color3Str, accSwingStr, accJetpackStr, dinfoStr, dinfowStr, dinfogStr, sinfoStr, sinfodStr, sinfogStr, udidStr, gjp2Str, gjpStr);
	
	    let gameVersion = await ExploitPatch.remove(gameVersionW);
	    let gameVersionArray = await gameVersion.split(",");
	    gameVersion = gameVersionArray[0];
	    const binaryVersion = await ExploitPatch.remove(binaryVersionW);
	    const coins = await ExploitPatch.remove(coinsW);
	    const iconType = await ExploitPatch.remove(iconTypeW);
	    const userCoins = await ExploitPatch.remove(userCoinsW);
	    const special = await ExploitPatch.remove(specialW);
	    const accIcon = await ExploitPatch.remove(accIconW);
	    const accShip = await ExploitPatch.remove(accShipW);
	    const accBall = await ExploitPatch.remove(accBallW);
	    const accBird = await ExploitPatch.remove(accBirdW);
	    const accDart = await ExploitPatch.remove(accDartW);
	    const accRobot = await ExploitPatch.remove(accRobotW);
	    const accGlow = await ExploitPatch.remove(accGlowW);
	    const accSpider = await ExploitPatch.remove(accSpiderW);
	    const accExplosion = await ExploitPatch.remove(accExplosionW);
	    const diamonds = await ExploitPatch.remove(diamondsW);
	    const moons = await ExploitPatch.remove(moonsW);
	    const color3 = await ExploitPatch.remove(color3W);
	    const accSwing = await ExploitPatch.remove(accSwingW);
	    const accJetpack = await ExploitPatch.remove(accJetpackW);
	    let dinfo = await ExploitPatch.numbercolon(dinfoW);
	    const dinfow = await ExploitPatch.number(dinfowW);
	    const dinfog = await ExploitPatch.number(dinfogW);
	    const sinfo = await ExploitPatch.numbercolon(sinfoW);
	    const sinfod = await ExploitPatch.number(sinfodW);
	    const sinfog = await ExploitPatch.number(sinfogW);
	
	    const id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
	    const userID = await ApiLib.getUserID(id, userName);
	    const uploadDate = Math.floor(Date.now() / 1000);
	    const hostname = ApiLib.getIP(req);
	    const query = `SELECT stars, coins, demons, userCoins, diamonds, moons FROM users WHERE userID = ? LIMIT 1`;
	    const [rows] = await db.execute(query, [userID]);
	    const old = rows[0];
	    //console.log(`DINFO: ${dinfo}`);
	
	    let starsCount;
	    let platformerCount;
	    let allDemons;
	    let demonsCountDiff;
	
	    if (dinfo != "") {
	        const query2 = `
	    SELECT
	        IFNULL(SUM(CASE WHEN starDemonDiff = 3 AND levelLength != 5 THEN 1 ELSE 0 END), 0) AS easyNormal,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 4 AND levelLength != 5 THEN 1 ELSE 0 END), 0) AS mediumNormal,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 0 AND levelLength != 5 THEN 1 ELSE 0 END), 0) AS hardNormal,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 5 AND levelLength != 5 THEN 1 ELSE 0 END), 0) AS insaneNormal,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 6 AND levelLength != 5 THEN 1 ELSE 0 END), 0) AS extremeNormal,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 3 AND levelLength = 5 THEN 1 ELSE 0 END), 0) AS easyPlatformer,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 4 AND levelLength = 5 THEN 1 ELSE 0 END), 0) AS mediumPlatformer,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 0 AND levelLength = 5 THEN 1 ELSE 0 END), 0) AS hardPlatformer,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 5 AND levelLength = 5 THEN 1 ELSE 0 END), 0) AS insanePlatformer,
	        IFNULL(SUM(CASE WHEN starDemonDiff = 6 AND levelLength = 5 THEN 1 ELSE 0 END), 0) AS extremePlatformer
	    FROM levels
	    WHERE levelID IN (${dinfo}) AND starDemon != 0;
	`;
	
	        const [rows2] = await db.query(query2);
	        const { easyNormal, mediumNormal, hardNormal, insaneNormal, extremeNormal, easyPlatformer, mediumPlatformer, hardPlatformer, insanePlatformer, extremePlatformer } = rows2[0];
	        allDemons = easyNormal + mediumNormal + hardNormal + insaneNormal + extremeNormal + easyPlatformer + mediumPlatformer + hardPlatformer + insanePlatformer + extremePlatformer;
	        demonsCountDiff = Math.min(demons - allDemons, 3);
	        dinfo = `${easyNormal + demonsCountDiff},${mediumNormal},${hardNormal},${insaneNormal},${extremeNormal},${easyPlatformer},${mediumPlatformer},${hardPlatformer},${insanePlatformer},${extremePlatformer},${dinfow},${dinfog}`;
	        //console.log("dinfo!");
	    }
	    if (sinfo != "") {
	        const sinfoArray = sinfo.split(",");
	        starsCount = `${sinfoArray[0]},${sinfoArray[1]},${sinfoArray[2]},${sinfoArray[3]},${sinfoArray[4]},${sinfoArray[5]},${sinfod},${sinfog}`;
	        platformerCount = `${sinfoArray[6]},${sinfoArray[7]},${sinfoArray[8]},${sinfoArray[9]},${sinfoArray[10]},${sinfoArray[11]},0`; // Last is for Map levels, unused until 2.21
	        //console.log("sinfo!");
	        //console.log("starsCount: " + starsCount);
	    }
	    //console.log(`GAME VERSION: ${gameVersion}`);
	    const query4 = `
	    UPDATE users
	    SET gameVersion = ?,
	        userName = ?,
	        coins = ?,
	        secret = ?,
	        stars = ?,
	        demons = ?,
	        icon = ?,
	        color1 = ?,
	        color2 = ?,
	        iconType = ?,
	        userCoins = ?,
	        special = ?,
	        accIcon = ?,
	        accShip = ?,
	        accBall = ?,
	        accBird = ?,
	        accDart = ?,
	        accRobot = ?,
	        accGlow = ?,
	        IP = ?,
	        lastPlayed = ?,
	        accSpider = ?,
	        accExplosion = ?,
	        diamonds = ?,
	        moons = ?,
	        color3 = ?,
	        accSwing = ?,
	        accJetpack = ?,
	        dinfo = ?,
	        sinfo = ?,
	        pinfo = ?
	    WHERE userID = ?
	`;
	    const params4 = [gameVersion, userName, coins, secret, stars, demons, icon, color1, color2, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, hostname, uploadDate, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, starsCount, platformerCount, userID];
	    const [rows4] = await db.execute(query4, params4);
	
	    const starsdiff = stars - old.stars;
	    const coindiff = coins - old.coins;
	    const demondiff = demons - old.demons;
	    const ucdiff = userCoins - old.userCoins;
	    const diadiff = diamonds - old.diamonds;
	    const moondiff = moons - old.moons;
	
	    const query3 = `
	    INSERT INTO actions (type, value, timestamp, account, value2, value3, value4, value5, value6)
	    VALUES ('9', ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	    const params3 = [starsdiff, Math.floor(Date.now() / 1000), userID, coindiff, demondiff, ucdiff, diadiff, moondiff];
	    const [rows3] = await db.execute(query3, params3);
	    const userIDsp = userID.toString();
		ConsoleApi.Log("main", `Updated user score: ${userName} (accountID: ${accountIDStr ? accountIDStr : "unknown"})`);  
	    return userIDsp;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.updateUserScore`);
	return "-1";
    }
};

module.exports = updateUserScore;
