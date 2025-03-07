'package net.fimastgd.forevercore.api.levels.suggestStars';

const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");
const cp = require("../system/calculateCPs");

const ConsoleApi = require("../../modules/console-api");

const suggestStars = async (gjp2Str, gjpStr, starsStr, featureStr, levelIDStr, accountIDStr, req) => {
	try {
	const gjp2check = gjp2Str || gjpStr;
	const gjp = await ExploitPatch.remove(gjp2check);
	const stars = await ExploitPatch.remove(starsStr);
	const feature = await ExploitPatch.remove(featureStr);
	const levelID = await ExploitPatch.remove(levelIDStr);
	const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
	const difficulty = await ApiLib.getDiffFromStars(stars);
	const starFeatured = await ApiLib.checkPermission(accountID, "actionRateFeature");
	const starEpic = await ApiLib.checkPermission(accountID, "actionRateEpic");
	const starLegendary = await ApiLib.checkPermission(accountID, "actionRateLegendary");
	const starMythic = await ApiLib.checkPermission(accountID, "actionRateMythic");
	if ((await ApiLib.checkPermission(accountID, "actionRateStars")) && starFeatured == false && !starEpic && !starLegendary && !starMythic) {
		await ApiLib.rateLevel(accountID, levelID, stars, difficulty.diff, difficulty.auto, difficulty.demon);
		ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: star rate`);
		return "1";
	} else if ((await ApiLib.checkPermission(accountID, "actionRateFeature")) && !starEpic && !starLegendary && !starMythic) {
		if (feature <= 1) {
			await ApiLib.rateLevel(accountID, levelID, stars, difficulty.diff, difficulty.auto, difficulty.demon);
			await ApiLib.featureLevel(accountID, levelID, feature);
			await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
			cp.calculate();
			ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: feature`);
			return "1";
		} else {
			return "-2";
		} 
	} else if ((await ApiLib.checkPermission(accountID, "actionRateEpic")) && !starLegendary && !starMythic) {
		if (feature <= 2) {
			await ApiLib.rateLevel(accountID, levelID, stars, difficulty.diff, difficulty.auto, difficulty.demon);
			await ApiLib.featureLevel(accountID, levelID, feature);
			await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
		    cp.calculate();
		    ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: epic`);
		    return "1";
		} else {
			return "-2";
		}
	} else if ((await ApiLib.checkPermission(accountID, "actionRateLegendary")) && !starMythic) {
		if (feature <= 3) {
			await ApiLib.rateLevel(accountID, levelID, stars, difficulty.diff, difficulty.auto, difficulty.demon);
			await ApiLib.featureLevel(accountID, levelID, feature);
			await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
			cp.calculate();
			ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: legendary`);
			return "1";
		} else {
			return "-2";
		}
	} else if (await ApiLib.checkPermission(accountID, "actionRateMythic")) {
		if (feature <= 4) {
			await ApiLib.rateLevel(accountID, levelID, stars, difficulty.diff, difficulty.auto, difficulty.demon);
		    const accountIDS = accountID.toString();
			const levelIDS = levelID.toString();
			const featureS = feature.toString();
			await ApiLib.featureLevel(accountIDS, levelIDS, featureS);
			await ApiLib.verifyCoinsLevel(accountID, levelID, 1);
			cp.calculate();
			ConsoleApi.Log("main", `MOD level rating. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: mythic`);
			return "1";
		} else {
			return "-2";
		}
	} else if (await ApiLib.checkPermission(accountID, "actionSuggestRating")) {
		await ApiLib.suggestLevel(accountID, levelID, difficulty.diff, stars, feature, difficulty.auto, difficulty.demon);
		ConsoleApi.Log("main", `MOD level sending to rate table. levelID: ${levelID}, difficulty: ${difficulty.diff}, rateMOD: suggesting`);
		return "1";
	} else {
		return "-2";
	}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.suggestStars`);
		return "-1";
	}
};

module.exports = suggestStars;