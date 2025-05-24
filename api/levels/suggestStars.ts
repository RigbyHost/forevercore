'package net.fimastgd.forevercore.api.levels.suggestStars';

import { Request } from 'express';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import GJPCheck from '../lib/GJPCheck';
import { calculate } from '../system/calculateCPs';
import ConsoleApi from '../../modules/console-api';

/**
 * Suggests or applies a star rating for a level
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param starsStr - Star count to assign (1-10)
 * @param featureStr - Feature status (0-4)
 * @param levelIDStr - Level ID to rate
 * @param accountIDStr - Account ID of moderator
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed, "-2" if no permission
 */
const suggestStars = async (
  gjp2Str?: string,
  gjpStr?: string,
  starsStr?: string,
  featureStr?: string,
  levelIDStr?: string,
  accountIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Process parameters
    const gjp2check = gjp2Str || gjpStr;
    const stars = await ExploitPatch.remove(starsStr);
    const feature = await ExploitPatch.remove(featureStr);
    const levelID = await ExploitPatch.remove(levelIDStr);
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    
    // Get difficulty from stars
    const difficulty = await ApiLib.getDiffFromStars(stars);
    
    // Check permissions
    const starFeatured = await ApiLib.checkPermission(accountID, "actionRateFeature");
    const starEpic = await ApiLib.checkPermission(accountID, "actionRateEpic");
    const starLegendary = await ApiLib.checkPermission(accountID, "actionRateLegendary");
    const starMythic = await ApiLib.checkPermission(accountID, "actionRateMythic");
    
    // Handle based on permission levels
    if ((await ApiLib.checkPermission(accountID, "actionRateStars")) && 
        !starFeatured && !starEpic && !starLegendary && !starMythic) {
      // Standard stars rater
      await ApiLib.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
      ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: star rate`);
      return "1";
    } else if (starFeatured && !starEpic && !starLegendary && !starMythic) {
      // Featured rater
      if (Number(feature) <= 1) {
        await ApiLib.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
        await ApiLib.featureLevel(accountID, levelID, feature);
        await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
        calculate();
        ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: feature`);
        return "1";
      } else {
        return "-2";
      }
    } else if (starEpic && !starLegendary && !starMythic) {
      // Epic rater
      if (Number(feature) <= 2) {
        await ApiLib.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
        await ApiLib.featureLevel(accountID, levelID, feature);
        await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
        calculate();
        ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: epic`);
        return "1";
      } else {
        return "-2";
      }
    } else if (starLegendary && !starMythic) {
      // Legendary rater
      if (Number(feature) <= 3) {
        await ApiLib.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
        await ApiLib.featureLevel(accountID, levelID, feature);
        await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
        calculate();
        ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: legendary`);
        return "1";
      } else {
        return "-2";
      }
    } else if (await ApiLib.checkPermission(accountID, "actionRateMythic")) {
      // Mythic rater
      if (Number(feature) <= 4) {
        await ApiLib.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
        
        // Convert values to string to ensure consistency
        const accountIDS = accountID.toString();
        const levelIDS = levelID.toString();
        const featureS = feature.toString();
        
        await ApiLib.featureLevel(accountIDS, levelIDS, featureS);
        await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
        calculate();
        
        ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: mythic`);
        return "1";
      } else {
        return "-2";
      }
    } else if (await ApiLib.checkPermission(accountID, "actionSuggestRating")) {
      // User can only suggest ratings
      await ApiLib.suggestLevel(accountID, levelID, difficulty.diff, stars, feature, difficulty.auto, difficulty.demon);
      ConsoleApi.Log("main", `MOD level sending to rate table. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: suggesting`);
      return "1";
    } else {
      // No permission
      return "-2";
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.suggestStars`);
    return "-1";
  }
};

export default suggestStars;