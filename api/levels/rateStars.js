'package net.fimastgd.forevercore.api.levels.rateStars';

const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const DiffLib = require("../lib/diffLib");
const db = require("../../serverconf/db");
const c = require("ansi-colors");
const settings = require("../../serverconf/settings");

const ConsoleApi = require("../../modules/console-api");

const rateStars = async (accountIDStr, gjp2Str, gjpStr, starsStr, levelIDStr, req) => {
	try {
    const gjp2check = gjp2Str || gjpStr;
    const gjp = await ExploitPatch.remove(gjp2check);
    const stars = await ExploitPatch.remove(starsStr);
    const levelID = await ExploitPatch.remove(levelIDStr);
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    const permState = await ApiLib.checkPermission(accountID, "actionRateStars");
    if (permState) {
        const difficulty = await ApiLib.getDiffFromStars(stars);
        await ApiLib.rateLevel(accountID, levelID, 0, difficulty.diff, difficulty.auto, difficulty.demon);
        ConsoleApi.Log("main", `Rated level ${levelID} by accountID: ${accountID} to ${stars} stars`);
        return "1";
    } else {
        /* Difficulty Vote system by me (like RobTop server) */
        if (settings.diffVote === true) {
            if (settings.diffVoteLevel < 2 || settings.diffVoteLevel > 50) {
                console.log(c.red(`[${dateNow()}] [main/ERROR]: diffVoteLevel must be >=2 and <=50`));
                return "1";
            } 
            if ((await DiffLib.canUserVote(accountID, levelID)) === true) {
                await DiffLib.vote(levelID, accountID, stars);
                if ((await DiffLib.votesCount(levelID)) >= settings.diffVoteLevel) {
                    let AVERAGE = await DiffLib.getAverageVote(levelID);
                    // like RobTop server, auto = easy, demon = insane
                    // you can set hardDiffVote = true to skip this (UNRECOMMENDED)
                    if (settings.hardDiffVote === false) {
                        if (AVERAGE == 1) AVERAGE = 2;
                        else if (AVERAGE == 10) AVERAGE = 9;
                    }
                    const difficulty = await ApiLib.getDiffFromStars(AVERAGE);
                    await ApiLib.rateLevel(accountID, levelID, 0, difficulty.diff, difficulty.auto, difficulty.demon);
                    ConsoleApi.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                    return "1";
                } else {
					ConsoleApi.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                    return "1";
                }
            } else {
				ConsoleApi.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                return "1";
            }
        } else {
			ConsoleApi.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
            return "1";
        }
    }
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateStars`);
		return "-1";
	}
};
module.exports = rateStars;