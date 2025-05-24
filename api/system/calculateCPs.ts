'package net.fimastgd.forevercore.api.system.calculateCPs';

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for CP (Creator Points) data
 */
interface CPData {
    [userID: string]: number;
}

/**
 * Calculate and assign creator points to users based on level ratings
 * @returns Promise resolving to "1" on success, "-1" on failure
 */
const calculate = async (): Promise<string> => {
    try {
        // Initialize data structures
        const people: CPData = {};

        // Step 1: Update user CP based on starred, featured and epic levels
        const updateQuery = `
            UPDATE users
            LEFT JOIN
            (
                SELECT usersTable.userID, (IFNULL(starredTable.starred, 0) + IFNULL(featuredTable.featured, 0) + (IFNULL(epicTable.epic,0)*1)) as CP FROM (
                    SELECT userID FROM users
                ) AS usersTable
                LEFT JOIN
                (
                    SELECT count(*) as starred, userID FROM levels WHERE starStars != 0 AND isCPShared = 0 GROUP BY(userID)
                ) AS starredTable ON usersTable.userID = starredTable.userID
                LEFT JOIN
                (
                    SELECT count(*) as featured, userID FROM levels WHERE starFeatured != 0 AND isCPShared = 0 GROUP BY(userID)
                ) AS featuredTable ON usersTable.userID = featuredTable.userID
                LEFT JOIN
                (
                    SELECT count(*)+(starEpic-1) as epic, userID FROM levels WHERE starEpic != 0 AND isCPShared = 0 GROUP BY(userID)
                ) AS epicTable ON usersTable.userID = epicTable.userID
            ) calculated
            ON users.userID = calculated.userID
            SET users.creatorPoints = IFNULL(calculated.CP, 0)
        `;

        await db.query(updateQuery);

        // Step 2: Handle CP sharing
        // Get levels with shared CP
        const [sharedLevels] = await db.query<RowDataPacket[]>(
            "SELECT levelID, userID, starStars, starFeatured, starEpic FROM levels WHERE isCPShared = 1"
        );

        for (const level of sharedLevels) {
            // Calculate deserved CP for the level
            let deservedCP = 0;

            if (level.starStars !== 0) {
                deservedCP++;
            }

            if (level.starFeatured !== 0) {
                deservedCP++;
            }

            if (level.starEpic !== 0) {
                // Epic - 1, Legendary - 2, Mythic - 3
                deservedCP += level.starEpic;
            }

            // Get users with CP shares for this level
            const [shares] = await db.query<RowDataPacket[]>(
                "SELECT userID FROM cpshares WHERE levelID = ?",
                [level.levelID]
            );

            // Calculate CP per user (including level creator)
            const shareCount = shares.length + 1;
            const cpPerUser = deservedCP / shareCount;

            // Assign CP to each user with share
            for (const share of shares) {
                people[share.userID] = (people[share.userID] || 0) + cpPerUser;
            }

            // Assign CP to level creator
            people[level.userID] = (people[level.userID] || 0) + cpPerUser;
        }

        // Step 3: Update CP for users with shared CP
        for (const [userID, cp] of Object.entries(people)) {
            await db.query(
                "UPDATE users SET creatorPoints = (creatorpoints + ?) WHERE userID = ?",
                [cp, userID]
            );
        }

        return "1";
    } catch (error) {
        ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.system.calculateCPs`);
        return "-1";
    }
};

export { calculate };