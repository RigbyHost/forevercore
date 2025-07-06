'package net.fimastgd.forevercore.api.scores.updateUserScore';

import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import db from '../../serverconf/db-proxy';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for user stats
 */
interface UserStats extends RowDataPacket {
  stars: number;
  coins: number;
  demons: number;
  userCoins: number;
  diamonds: number;
  moons: number;
}

/**
 * Updates a user's stats in Geometry Dash
 * @param accountIDStr - Account ID
 * @param userNameStr - Username
 * @param secretStr - Secret token
 * @param starsStr - Star count
 * @param demonsStr - Demon count
 * @param iconStr - Icon ID
 * @param color1Str - Primary color
 * @param color2Str - Secondary color
 * @param gameVersionStr - Game version
 * @param binaryVersionStr - Binary version
 * @param coinsStr - Coin count
 * @param iconTypeStr - Icon type
 * @param userCoinsStr - User coin count
 * @param specialStr - Special icon
 * @param accIconStr - Account icon
 * @param accShipStr - Ship icon
 * @param accBallStr - Ball icon
 * @param accBirdStr - Bird/UFO icon
 * @param accDartStr - Dart/Wave icon
 * @param accRobotStr - Robot icon
 * @param accGlowStr - Glow status
 * @param accSpiderStr - Spider icon
 * @param accExplosionStr - Explosion icon
 * @param diamondsStr - Diamond count
 * @param moonsStr - Moon count
 * @param color3Str - Tertiary color
 * @param accSwingStr - Swing icon
 * @param accJetpackStr - Jetpack icon
 * @param dinfoStr - Demon info
 * @param dinfowStr - Demon info width
 * @param dinfogStr - Demon info glow
 * @param sinfoStr - Star info
 * @param sinfodStr - Star info display
 * @param sinfogStr - Star info glow
 * @param udidStr - Device ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns User ID if successful, "-1" if failed
 */
const updateUserScore = async (
  accountIDStr?: string,
  userNameStr?: string,
  secretStr?: string,
  starsStr?: string,
  demonsStr?: string,
  iconStr?: string,
  color1Str?: string,
  color2Str?: string,
  gameVersionStr?: string,
  binaryVersionStr?: string,
  coinsStr?: string,
  iconTypeStr?: string,
  userCoinsStr?: string,
  specialStr?: string,
  accIconStr?: string,
  accShipStr?: string,
  accBallStr?: string,
  accBirdStr?: string,
  accDartStr?: string,
  accRobotStr?: string,
  accGlowStr?: string,
  accSpiderStr?: string,
  accExplosionStr?: string,
  diamondsStr?: string,
  moonsStr?: string,
  color3Str?: string,
  accSwingStr?: string,
  accJetpackStr?: string,
  dinfoStr?: string,
  dinfowStr?: string,
  dinfogStr?: string,
  sinfoStr?: string,
  sinfodStr?: string,
  sinfogStr?: string,
  udidStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Validate required parameters
    if (!userNameStr || !secretStr || !starsStr || !demonsStr || !iconStr || !color1Str || !color2Str) {
      ConsoleApi.Log("main", `Failed to update user score ${userNameStr} (accountID: ${accountIDStr}): needed params not found`);
      return "-1";
    }

    // Process input parameters
    const userName = await ExploitPatch.charclean(userNameStr);
    const secret = await ExploitPatch.remove(secretStr);
    const stars = await ExploitPatch.remove(starsStr);
    const demons = await ExploitPatch.remove(demonsStr);
    const icon = await ExploitPatch.remove(iconStr);
    const color1 = await ExploitPatch.remove(color1Str);
    const color2 = await ExploitPatch.remove(color2Str);
    
    // Set defaults for optional parameters
    const gameVersionW = gameVersionStr || "1";
    const binaryVersionW = binaryVersionStr || "1";
    const coinsW = coinsStr || "0";
    const iconTypeW = iconTypeStr || "0";
    const userCoinsW = userCoinsStr || "0";
    const specialW = specialStr || "0";
    const accIconW = accIconStr || "0";
    const accShipW = accShipStr || "0";
    const accBallW = accBallStr || "0";
    const accBirdW = accBirdStr || "0";
    const accDartW = accDartStr || "0";
    const accRobotW = accRobotStr || "0";
    const accGlowW = accGlowStr || "0";
    const accSpiderW = accSpiderStr || "0";
    const accExplosionW = accExplosionStr || "0";
    const diamondsW = diamondsStr || "0";
    const moonsW = moonsStr || "0";
    const color3W = color3Str || "0";
    const accSwingW = accSwingStr || "0";
    const accJetpackW = accJetpackStr || "0";
    const dinfoW = dinfoStr || "";
    const dinfowW = dinfowStr || "0";
    const dinfogW = dinfogStr || "0";
    const sinfoW = sinfoStr || "";
    const sinfodW = sinfodStr || "0";
    const sinfogW = sinfogStr || "0";
    
    // Process and validate parameters
    const gameVersion = await ExploitPatch.remove(gameVersionW);
    const gameVersionArray = await gameVersion.split(",");
    const gameVersionFinal = gameVersionArray[0];
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
    
    // Process demon info
    let dinfo = await ExploitPatch.numbercolon(dinfoW);
    const dinfow = await ExploitPatch.number(dinfowW);
    const dinfog = await ExploitPatch.number(dinfogW);
    
    // Process star info
    const sinfo = await ExploitPatch.numbercolon(sinfoW);
    const sinfod = await ExploitPatch.number(sinfodW);
    const sinfog = await ExploitPatch.number(sinfogW);
    
    // Get user ID
    const id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
    const userID = await ApiLib.getUserID(id, userName);
    const uploadDate = Math.floor(Date.now() / 1000);
    const hostname = ApiLib.getIP(req);
    
    // Get current stats
    const query = `SELECT stars, coins, demons, userCoins, diamonds, moons FROM users WHERE userID = ? LIMIT 1`;
    const [rows] = await db.execute<UserStats[]>(query, [userID]);
    const old = rows[0];
    
    let starsCount: string;
    let platformerCount: string;
    let allDemons: number;
    let demonsCountDiff: number;
    
    // Process demon info data for stat tracking
    if (dinfo !== "") {
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
      
      const [rows2] = await db.query<RowDataPacket[]>(query2);
      const { 
        easyNormal, mediumNormal, hardNormal, insaneNormal, extremeNormal,
        easyPlatformer, mediumPlatformer, hardPlatformer, insanePlatformer, extremePlatformer 
      } = rows2[0];
      
      allDemons = easyNormal + mediumNormal + hardNormal + insaneNormal + extremeNormal +
                 easyPlatformer + mediumPlatformer + hardPlatformer + insanePlatformer + extremePlatformer;
      
      demonsCountDiff = Math.min(Number(demons) - allDemons, 3);
      
      dinfo = `${easyNormal + demonsCountDiff},${mediumNormal},${hardNormal},${insaneNormal},${extremeNormal},` +
             `${easyPlatformer},${mediumPlatformer},${hardPlatformer},${insanePlatformer},${extremePlatformer},` +
             `${dinfow},${dinfog}`;
    }
    
    // Process star info data
    if (sinfo !== "") {
      const sinfoArray = sinfo.split(",");
      starsCount = `${sinfoArray[0]},${sinfoArray[1]},${sinfoArray[2]},${sinfoArray[3]},${sinfoArray[4]},${sinfoArray[5]},${sinfod},${sinfog}`;
      platformerCount = `${sinfoArray[6]},${sinfoArray[7]},${sinfoArray[8]},${sinfoArray[9]},${sinfoArray[10]},${sinfoArray[11]},0`; // Last is for Map levels, unused until 2.21
    }
    
    // Update user stats
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
    
    const params4 = [
      gameVersionFinal, userName, coins, secret, stars, demons, icon, color1, color2,
      iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart,
      accRobot, accGlow, hostname, uploadDate, accSpider, accExplosion, diamonds,
      moons, color3, accSwing, accJetpack, dinfo, starsCount, platformerCount, userID
    ];
    
    await db.execute<ResultSetHeader>(query4, params4);
    
    // Track stat changes
    const starsdiff = Number(stars) - old.stars;
    const coindiff = Number(coins) - old.coins;
    const demondiff = Number(demons) - old.demons;
    const ucdiff = Number(userCoins) - old.userCoins;
    const diadiff = Number(diamonds) - old.diamonds;
    const moondiff = Number(moons) - old.moons;
    
    // Log action
    const query3 = `
      INSERT INTO actions (type, value, timestamp, account, value2, value3, value4, value5, value6)
      VALUES ('9', ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params3 = [
      starsdiff, Math.floor(Date.now() / 1000), userID, coindiff, demondiff, ucdiff, diadiff, moondiff
    ];
    
    await db.execute<ResultSetHeader>(query3, params3);
    
    ConsoleApi.Log("main", `Updated user score: ${userName} (accountID: ${accountIDStr ? accountIDStr : "unknown"})`);
    return userID.toString();
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.updateUserScore`);
    return "-1";
  }
};

export default updateUserScore;