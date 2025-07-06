'package net.fimastgd.forevercore.api.comments.getAccountComments';

import { Connection, RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for account comment data
 */
interface AccountComment {
    comment: string;
    userID: number;
    likes: number;
    isSpam: number;
    commentID: number;
    timestamp: number;
}

/**
 * Get account comments for a user
 * @param accountIDStr - Account ID string
 * @param pageStr - Page number string
 * @param req - Express request object
 * @returns Formatted comments string
 */
const getAccountComments = async (
    accountIDStr: string | string[],
    pageStr: string,
    req?: any
): Promise<string> => {
    try {
        let accountID: string;

        // ВАЖНО: Обработка краевого случая с массивом
        if (Array.isArray(accountIDStr)) {
            ConsoleApi.Warn("main", "Array instead of Int detected, trying to offset array...");
            accountID = await ExploitPatch.remove(accountIDStr[1]);
        } else {
            accountID = await ExploitPatch.remove(accountIDStr);
        }

        // Parse page number
        const page = await ExploitPatch.remove(pageStr);
        const commentpage = parseInt(page) * 10;

        // Get user ID for the account
        const userID = await ApiLib.getUserID(accountID);
        const userIDInt = parseInt(userID.toString(), 10);
        const commentpageInt = parseInt(commentpage.toString(), 10);

        // Query database for comments
        const query = `
            SELECT comment, userID, likes, isSpam, commentID, timestamp
            FROM acccomments
            WHERE userID = ?
            ORDER BY timestamp DESC
                LIMIT 10 OFFSET ?
        `;

        const [rows] = await db.execute<RowDataPacket[]>(query, [userIDInt, commentpageInt.toString()]);

        // Return early if no comments found
        if (rows.length === 0) {
            return "#0:0:0";
        }

        // Build comment string
        let commentstring = "";

        for (const comment1 of rows) {
            if (comment1.commentID) {
                // Format date for display
                const timestampInSeconds = comment1.timestamp;
                const timestampInMilliseconds = timestampInSeconds * 1000;
                const date = new Date(timestampInMilliseconds);
                const uploadDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

                // Build comment data string
                commentstring += `2~${comment1.comment}~3~${comment1.userID}~4~${comment1.likes}~5~0~7~${comment1.isSpam}~9~${uploadDate}~6~${comment1.commentID}|`;
            }
        }

        // Remove trailing pipe
        commentstring = commentstring.slice(0, -1);

        // Get total comment count
        const countquery = "SELECT COUNT(*) FROM acccomments WHERE userID = ?";
        const [countResult] = await db.execute<RowDataPacket[]>(countquery, [userID]);
        const commentcount = countResult[0]["COUNT(*)"];

        ConsoleApi.Log("main", `Received account comments. accountID: ${accountID}`);
        return `${commentstring}#${commentcount}:${commentpage}:10`;
    } catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.comments.getAccountComments`);
        return "-1";
    }
};

export default getAccountComments;