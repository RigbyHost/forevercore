'package net.fimastgd.forevercore.api.comments.uploadComments';

import { Request } from 'express';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import CommandLib from '../lib/commandLib';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Upload a comment to a level
 * @param userNameStr - Username
 * @param gameVersionStr - Game version
 * @param commentStr - Comment content
 * @param levelIDStr - Level ID
 * @param percentStr - Completion percentage
 * @param udidStr - Device ID
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns Status (1 = success, -1 = failure)
 */
const uploadComment = async (
    userNameStr?: string,
    gameVersionStr?: string,
    commentStr?: string,
    levelIDStr?: string,
    percentStr?: string,
    udidStr?: string,
    accountIDStr?: string,
    gjp2Str?: string,
    gjpStr?: string,
    req?: Request
): Promise<string> => {
    try {
        // Process input params
        const userName = userNameStr ? await ExploitPatch.remove(userNameStr) : "";
        const gameVersion = gameVersionStr ? await ExploitPatch.number(gameVersionStr) : 0;

        // Handle comment encoding based on game version
        let comment = await ExploitPatch.remove(commentStr);
        comment = parseInt(gameVersion.toString()) < 20 ?
            Buffer.from(comment).toString("base64") :
            comment;

        // Process level ID - handling negative levels with special prefix
        const levelID = (levelIDStr < 0 ? "-" : "") + (await ExploitPatch.number(levelIDStr));
        const percent = percentStr ? await ExploitPatch.remove(percentStr) : 0;

        // Get user ID from credentials
        let id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        id = parseInt(id);
        const register = !isNaN(id);
        const userID = await ApiLib.getUserID(id, userName);
        const uploadDate = Math.floor(Date.now() / 1000);

        // Decode comment for command processing
        const decodecomment = Buffer.from(comment, "base64").toString("utf-8");

        // Check for special commands
        const commandResult = await CommandLib.doCommands(id, decodecomment, levelID);

        if (commandResult === true) {
            // Command executed successfully
            const reslt = parseInt(gameVersion.toString()) > 20 ?
                "temp_0_<cg>Command completed successfully!</c>" :
                "-1";
            return reslt;
        } else if (commandResult === "NO") {
            // No permission for command
            const resltNO = parseInt(gameVersion.toString()) > 20 ?
                "temp_0_<cr>No permissions</c>" :
                "-1";
            return resltNO;
        }

        // No command found, process as regular comment
        if (id !== "" && comment !== "") {
            // Insert comment
            const [result] = await db.execute<ResultSetHeader>(
                "INSERT INTO comments (userName, comment, levelID, userID, timeStamp, percent) VALUES (?, ?, ?, ?, ?, ?)",
                [userName, comment, levelID, userID, uploadDate, percent]
            );

            // If registered user with completion percentage
            if (register && parseInt(percent.toString()) !== 0) {
                // Check for existing score
                const [rows] = await db.execute<RowDataPacket[]>(
                    "SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ?",
                    [id, levelID]
                );

                if (rows.length === 0) {
                    // Create new score record
                    await db.execute(
                        "INSERT INTO levelscores (accountID, levelID, percent, uploadDate) VALUES (?, ?, ?, ?)",
                        [id, levelID, percent, uploadDate]
                    );
                } else if (rows[0].percent < percent) {
                    // Update score if better than previous
                    await db.execute(
                        "UPDATE levelscores SET percent = ?, uploadDate = ? WHERE accountID = ? AND levelID = ?",
                        [percent, uploadDate, id, levelID]
                    );
                }

                ConsoleApi.Log("main", `Uploaded comment to level ${levelID} by ${userName}: ${comment}`);
                return "1";
            } else {
                ConsoleApi.Log("main", `Uploaded comment to level ${levelID} by ${userName}: ${comment}`);
                return "1";
            }
        } else {
            ConsoleApi.Warn("main", `Failed upload comment to level ${levelID} by ${userName}: ${comment}`);
            return "-1";
        }
    } catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.uploadComment`);
        return "-1";
    }
};

export default uploadComment;