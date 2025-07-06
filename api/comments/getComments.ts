'package net.fimastgd.forevercore.api.comments.getComments';

import { Connection, RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for comment data structure
 */
interface CommentData {
    levelID: number;
    commentID: number;
    timestamp: number;
    comment: string;
    userID: number;
    likes: number;
    isSpam: number;
    percent: number;
    userName?: string;
    icon?: number;
    color1?: number;
    color2?: number;
    iconType?: number;
    special?: number;
    extID?: number | string;
}

/**
 * Gets comments for a level or user
 * @param binaryVersionStr - Binary version string
 * @param gameVersionStr - Game version string
 * @param modeStr - Sort mode string (0 = most recent, 1 = most liked)
 * @param countStr - Number of comments to retrieve
 * @param pageStr - Page number
 * @param levelIDStr - Level ID string (if getting level comments)
 * @param userIDStr - User ID string (if getting user comments)
 * @returns Formatted comments string
 */
const getComments = async (
    binaryVersionStr?: string,
    gameVersionStr?: string,
    modeStr?: string,
    countStr?: string,
    pageStr?: string,
    levelIDStr?: string,
    userIDStr?: string
): Promise<string> => {
    try {
        const commentstring: string[] = [];
        const userstring: string[] = [];
        const users = new Set<number>();

        // Parse parameters
        const binaryVersion = binaryVersionStr ? await ExploitPatch.remove(binaryVersionStr) : '0';
        const gameVersion = gameVersionStr ? await ExploitPatch.remove(gameVersionStr) : '0';
        const mode = modeStr ? await ExploitPatch.remove(modeStr) : '0';
        const count = countStr && !isNaN(Number(countStr)) ? await ExploitPatch.remove(countStr) : '10';
        const page = pageStr ? await ExploitPatch.remove(pageStr) : '0';
        const commentpage = parseInt(page) * parseInt(count);
        const modeColumn = mode == '0' ? "commentID" : "likes";

        // Set up query variables based on filter type (level or user)
        let filterColumn: string,
            filterToFilter: string,
            displayLevelID: boolean,
            filterID: string,
            userListJoin: string,
            userListWhere: string,
            userListColumns: string;

        if (levelIDStr) {
            filterColumn = "levelID";
            filterToFilter = "";
            displayLevelID = false;
            filterID = await ExploitPatch.remove(levelIDStr);
            userListJoin = userListWhere = userListColumns = "";
        } else if (userIDStr) {
            filterColumn = "userID";
            filterToFilter = "comments.";
            displayLevelID = true;
            filterID = await ExploitPatch.remove(userIDStr);
            userListColumns = ", levels.unlisted";
            userListJoin = "INNER JOIN levels ON comments.levelID = levels.levelID";
            userListWhere = "AND levels.unlisted = 0";
        } else {
            return "-1";
        }

        // Get comment count
        const [countResult] = await db.query<RowDataPacket[]>(
            `SELECT count(*) as count FROM comments ${userListJoin} WHERE ${filterToFilter}${filterColumn} = ? ${userListWhere}`,
            [filterID]
        );

        const commentcount = countResult[0].count;

        if (commentcount == 0) {
            return "-2";
        }

        // Get comments
        const [result] = await db.query<RowDataPacket[]>(
            `SELECT comments.levelID, comments.commentID, comments.timestamp, comments.comment, 
                comments.userID, comments.likes, comments.isSpam, comments.percent, 
                users.userName, users.icon, users.color1, users.color2, users.iconType, 
                users.special, users.extID 
            FROM comments 
            LEFT JOIN users ON comments.userID = users.userID 
            ${userListJoin} 
            WHERE comments.${filterColumn} = ? ${userListWhere} 
            ORDER BY comments.${modeColumn} DESC 
            LIMIT ? OFFSET ?`,
            [filterID, parseInt(count), commentpage]
        );

        const visiblecount = result.length;
        const binVer = parseInt(binaryVersion);
        const gameVer = parseInt(gameVersion);

        // Process each comment
        for (const comment1 of result) {
            if (comment1.commentID) {
                // Format date
                const uploadDate = new Date(comment1.timestamp * 1000).toLocaleString(
                    "en-GB",
                    { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
                )
                    .replace(/,/g, "")
                    .replace(/:/g, ".");

                // Handle comment text based on game version
                const commentText = gameVer < 20
                    ? Buffer.from(comment1.comment, "base64").toString()
                    : comment1.comment;

                // Build comment parts
                const commentParts: string[] = [];

                if (displayLevelID) commentParts.push(`1~${comment1.levelID}`);

                commentParts.push(
                    `2~${commentText}`,
                    `3~${comment1.userID}`,
                    `4~${comment1.likes}`,
                    `5~0`,
                    `7~${comment1.isSpam}`,
                    `9~${uploadDate}`,
                    `6~${comment1.commentID}`,
                    `10~${comment1.percent}`
                );

                // Handle user data based on binary version
                if (comment1.userName) {
                    const extID = !isNaN(Number(comment1.extID)) ? comment1.extID : 0;

                    if (typeof binVer === 'number' && binVer > 31) {
                        // For newer binary versions, include badge and color info
                        const badge = await ApiLib.getMaxValuePermission(extID, "modBadgeLevel");
                        
                        // Check if badge is a number and greater than 0
                        const badgeValue = typeof badge === 'number' && badge > 0;
                        const colorString = badgeValue ? `~12~${await ApiLib.getAccountCommentColor(extID)}` : "";

                        commentParts.push(
                            `11~${badge}${colorString}:1~${comment1.userName}~7~1~9~${comment1.icon}~10~${comment1.color1}~11~${comment1.color2}~14~${comment1.iconType}~15~${comment1.special}~16~${extID}`
                        );
                    } else if (!users.has(comment1.userID)) {
                        // For older versions, add to userstring
                        users.add(comment1.userID);
                        userstring.push(`${comment1.userID}:${comment1.userName}:${extID}`);
                    }
                }

                commentstring.push(commentParts.join("~"));
            }
        }

        // Construct final response
        let response = commentstring.join("|");

        if (typeof binVer === 'number' && binVer < 32) {
            response += `#${userstring.join("|")}`;
        }

        response += `#${commentcount}:${commentpage}:${visiblecount}`;

        ConsoleApi.Log("main", `Received ${commentcount} comments, page ${commentpage}`);
        return response;
    } catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.getComments`);
        return "-1";
    }
};

export default getComments;