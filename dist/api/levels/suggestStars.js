'package net.fimastgd.forevercore.api.levels.suggestStars';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const calculateCPs_1 = require("../system/calculateCPs");
const console_api_1 = __importDefault(require("../../modules/console-api"));
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
const suggestStars = async (gjp2Str, gjpStr, starsStr, featureStr, levelIDStr, accountIDStr, req) => {
    try {
        // Process parameters
        const gjp2check = gjp2Str || gjpStr;
        const stars = await exploitPatch_1.default.remove(starsStr);
        const feature = await exploitPatch_1.default.remove(featureStr);
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Get difficulty from stars
        const difficulty = await apiLib_1.default.getDiffFromStars(stars);
        // Check permissions
        const starFeatured = await apiLib_1.default.checkPermission(accountID, "actionRateFeature");
        const starEpic = await apiLib_1.default.checkPermission(accountID, "actionRateEpic");
        const starLegendary = await apiLib_1.default.checkPermission(accountID, "actionRateLegendary");
        const starMythic = await apiLib_1.default.checkPermission(accountID, "actionRateMythic");
        // Handle based on permission levels
        if ((await apiLib_1.default.checkPermission(accountID, "actionRateStars")) &&
            !starFeatured && !starEpic && !starLegendary && !starMythic) {
            // Standard stars rater
            await apiLib_1.default.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
            console_api_1.default.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: star rate`);
            return "1";
        }
        else if (starFeatured && !starEpic && !starLegendary && !starMythic) {
            // Featured rater
            if (Number(feature) <= 1) {
                await apiLib_1.default.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
                await apiLib_1.default.featureLevel(accountID, levelID, feature);
                await apiLib_1.default.verifyCoinsLevel(accountID, levelID, 1);
                (0, calculateCPs_1.calculate)();
                console_api_1.default.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: feature`);
                return "1";
            }
            else {
                return "-2";
            }
        }
        else if (starEpic && !starLegendary && !starMythic) {
            // Epic rater
            if (Number(feature) <= 2) {
                await apiLib_1.default.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
                await apiLib_1.default.featureLevel(accountID, levelID, feature);
                await apiLib_1.default.verifyCoinsLevel(accountID, levelID, 1);
                (0, calculateCPs_1.calculate)();
                console_api_1.default.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: epic`);
                return "1";
            }
            else {
                return "-2";
            }
        }
        else if (starLegendary && !starMythic) {
            // Legendary rater
            if (Number(feature) <= 3) {
                await apiLib_1.default.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
                await apiLib_1.default.featureLevel(accountID, levelID, feature);
                await apiLib_1.default.verifyCoinsLevel(accountID, levelID, 1);
                (0, calculateCPs_1.calculate)();
                console_api_1.default.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: legendary`);
                return "1";
            }
            else {
                return "-2";
            }
        }
        else if (await apiLib_1.default.checkPermission(accountID, "actionRateMythic")) {
            // Mythic rater
            if (Number(feature) <= 4) {
                await apiLib_1.default.rateLevel(accountID, levelID, parseInt(stars), difficulty.diff, difficulty.auto, difficulty.demon);
                // Convert values to string to ensure consistency
                const accountIDS = accountID.toString();
                const levelIDS = levelID.toString();
                const featureS = feature.toString();
                await apiLib_1.default.featureLevel(accountIDS, levelIDS, featureS);
                await apiLib_1.default.verifyCoinsLevel(accountID, levelID, 1);
                (0, calculateCPs_1.calculate)();
                console_api_1.default.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: mythic`);
                return "1";
            }
            else {
                return "-2";
            }
        }
        else if (await apiLib_1.default.checkPermission(accountID, "actionSuggestRating")) {
            // User can only suggest ratings
            await apiLib_1.default.suggestLevel(accountID, levelID, difficulty.diff, stars, feature, difficulty.auto, difficulty.demon);
            console_api_1.default.Log("main", `MOD level sending to rate table. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: suggesting`);
            return "1";
        }
        else {
            // No permission
            return "-2";
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.suggestStars`);
        return "-1";
    }
};
exports.default = suggestStars;
