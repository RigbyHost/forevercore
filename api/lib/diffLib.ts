"package net.fimastgd.forevercore.api.lib.diffLib";

import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";

/**
 * Utility class for difficulty voting system
 */
class DiffLib {
	/**
	 * Check if user can vote for difficulty on a level
	 * @param accountID - Account ID
	 * @param levelID - Level ID
	 * @returns True if user can vote
	 */
	static async canUserVote(gdpsid: string, accountID: number | string, levelID: number | string): Promise<boolean> {
		const db = await threadConnection(gdpsid);
		try {
			const query = "SELECT COUNT(*) AS count FROM diffVote WHERE accountID = ? AND levelID = ?";
			const [rows] = await db.execute<RowDataPacket[]>(query, [accountID, levelID]);

			// User can vote if they haven't already voted more than once
			return rows[0].count <= 1;
		} catch (error) {
			ConsoleApi.Error("main", `canUserVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
			return false;
		}
	}

	/**
	 * Get average difficulty vote for a level
	 * @param levelID - Level ID
	 * @returns Average star count or false if error
	 */
	static async getAverageVote(gdpsid: string, levelID: number | string): Promise<number | false> {
		const db = await threadConnection(gdpsid);
		try {
			const [rows] = await db.query<RowDataPacket[]>("SELECT stars FROM diffVote WHERE levelID = ?", [levelID]);

			// Calculate average stars from all votes
			const starsArray = rows.map(row => row.stars);
			const averageStars = Math.round(starsArray.reduce((acc, val) => acc + val, 0) / starsArray.length);

			return averageStars;
		} catch (error) {
			ConsoleApi.Error("main", `getAverageVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
			return false;
		}
	}

	/**
	 * Count the number of votes for a level
	 * @param levelID - Level ID
	 * @returns Vote count
	 */
	static async votesCount(gdpsid: string, levelID: number | string): Promise<number> {
		const db = await threadConnection(gdpsid);
		try {
			const query = "SELECT COUNT(*) AS count FROM diffVote WHERE levelID = ?";
			const [rows] = await db.execute<RowDataPacket[]>(query, [levelID]);

			return rows[0].count;
		} catch (error) {
			ConsoleApi.Error("main", `votesCountException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
			return -1;
		}
	}

	/**
	 * Register a difficulty vote for a level
	 * @param levelID - Level ID
	 * @param accountID - Account ID
	 * @param stars - Star count
	 * @returns True if vote successful
	 */
	static async vote(gdpsid: string, levelID: number | string, accountID: number | string, stars: number | string): Promise<boolean> {
		const db = await threadConnection(gdpsid);
		try {
			const query = "INSERT INTO diffVote (levelID, accountID, stars, timestamp) VALUES (?, ?, ?, ?)";
			await db.execute(query, [levelID, accountID, stars, Math.floor(Date.now() / 1000)]);

			return true;
		} catch (error) {
			ConsoleApi.Error("main", `voteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
			return false;
		}
	}
}

export default DiffLib;
