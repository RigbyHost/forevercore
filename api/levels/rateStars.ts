'package net.fimastgd.forevercore.api.levels.rateStars';

import { Request } from 'express';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import DiffLib from '../lib/diffLib';
import db from '../../serverconf/db';
import { settings } from '../../serverconf/settings';
import ConsoleApi from '../../modules/console-api';

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
const rateStars = async (
  accountIDStr?: string,
  gjp2Str?: string,
  gjpStr?: string,
  starsStr?: string,
  levelIDStr?: string,
  req?: Request
): Promise<string> => {
  try {
    // Process parameters
    const gjp2check = gjp2Str || gjpStr;
    const stars = await ExploitPatch.remove(starsStr);
    const levelID = await ExploitPatch.remove(levelIDStr);
    
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
    
    // Check if user has permission to rate stars
    const permState = await ApiLib.checkPermission(accountID, "actionRateStars");
    
    if (permState) {
      // Moderator rating - apply directly
      const difficulty = await ApiLib.getDiffFromStars(stars);
      await ApiLib.rateLevel(accountID, levelID, 0, difficulty.diff, difficulty.auto, difficulty.demon);
      
      ConsoleApi.Log("main", `Rated level ${levelID} by accountID: ${accountID} to ${stars} stars`);
      return "1";
    } else {
      // Handle user voting system if enabled
      if (settings.diffVote === true) {
        // Validate vote level settings
        if (settings.diffVoteLevel < 2 || settings.diffVoteLevel > 50) {
          ConsoleApi.Error("main", "diffVoteLevel must be >=2 and <=50");
          return "1";
        }
        
        // Check if user can vote
        if ((await DiffLib.canUserVote(accountID, levelID)) === true) {
          // Register vote
          await DiffLib.vote(levelID, accountID, stars);
          
          // Check if enough votes to change difficulty
          if ((await DiffLib.votesCount(levelID)) >= settings.diffVoteLevel) {
            const avgVote = await DiffLib.getAverageVote(levelID);
            let AVERAGE = typeof avgVote === 'number' ? avgVote : 0;
            
            // Adjust ratings for auto/demon like RobTop server
            if (settings.hardDiffVote === false) {
              if (AVERAGE == 1) AVERAGE = 2;
              else if (AVERAGE == 10) AVERAGE = 9;
            }
            
            // Apply difficulty from votes
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
        // Voting disabled, just log
        ConsoleApi.Log("main", `Level ${levelID} assigned new user difficulty from vote`);
        return "1";
      }
    }
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.rateStars`);
    return "-1";
  }
};

export default rateStars;