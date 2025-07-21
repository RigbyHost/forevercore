'package net.fimastgd.forevercore.api.levels.rateStars';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const diffLib_1 = __importDefault(require("../lib/diffLib"));
const settings_1 = require("../../serverconf/settings");
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Rates a level with stars in Geometry Dash
 * @param accountIDStr - Account ID of moderator
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param starsStr - Stars to assign (1-10)
 * @param levelIDStr - Level ID to rate
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const rateStars = async (accountIDStr, gjp2Str, gjpStr, starsStr, levelIDStr, req) => {
    try {
        // Process parameters
        const gjp2check = gjp2Str || gjpStr;
        const stars = await exploitPatch_1.default.remove(starsStr);
        const levelID = await exploitPatch_1.default.remove(levelIDStr);
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Check if user has permission to rate stars
        const permState = await apiLib_1.default.checkPermission(accountID, "actionRateStars");
        if (permState) {
            // Moderator rating - apply directly
            const difficulty = await apiLib_1.default.getDiffFromStars(stars);
            await apiLib_1.default.rateLevel(accountID, levelID, 0, difficulty.diff, difficulty.auto, difficulty.demon);
            console_api_1.default.Log("main", `Rated level ${levelID} by accountID: ${accountID} to ${stars} stars`);
            return "1";
        }
        else {
            // Handle user voting system if enabled
            if (settings_1.settings.diffVote === true) {
                // Validate vote level settings
                if (settings_1.settings.diffVoteLevel < 2 || settings_1.settings.diffVoteLevel > 50) {
                    console_api_1.default.Error("main", "diffVoteLevel must be >=2 and <=50");
                    return "1";
                }
                // Check if user can vote
                if ((await diffLib_1.default.canUserVote(accountID, levelID)) === true) {
                    // Register vote
                    await diffLib_1.default.vote(levelID, accountID, stars);
                    // Check if enough votes to change difficulty
                    if ((await diffLib_1.default.votesCount(levelID)) >= settings_1.settings.diffVoteLevel) {
                        const avgVote = await diffLib_1.default.getAverageVote(levelID);
                        let AVERAGE = typeof avgVote === 'number' ? avgVote : 0;
                        // Adjust ratings for auto/demon like RobTop server
                        if (settings_1.settings.hardDiffVote === false) {
                            if (AVERAGE == 1)
                                AVERAGE = 2;
                            else if (AVERAGE == 10)
                                AVERAGE = 9;
                        }
                        // Apply difficulty from votes
                        const difficulty = await apiLib_1.default.getDiffFromStars(AVERAGE);
                        await apiLib_1.default.rateLevel(accountID, levelID, 0, difficulty.diff, difficulty.auto, difficulty.demon);
                        console_api_1.default.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                        return "1";
                    }
                    else {
                        console_api_1.default.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                        return "1";
                    }
                }
                else {
                    console_api_1.default.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                    return "1";
                }
            }
            else {
                // Voting disabled, just log
                console_api_1.default.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
                return "1";
            }
        }
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateStars`);
        return "-1";
    }
};
exports.default = rateStars;
