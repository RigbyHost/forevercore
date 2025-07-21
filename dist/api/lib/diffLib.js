'package net.fimastgd.forevercore.api.lib.diffLib';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
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
    static async canUserVote(accountID, levelID) {
        try {
            const query = "SELECT COUNT(*) AS count FROM diffVote WHERE accountID = ? AND levelID = ?";
            const [rows] = await db_proxy_1.default.execute(query, [accountID, levelID]);
            // User can vote if they haven't already voted more than once
            return rows[0].count <= 1;
        }
        catch (error) {
            console_api_1.default.Error("main", `canUserVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return false;
        }
    }
    /**
     * Get average difficulty vote for a level
     * @param levelID - Level ID
     * @returns Average star count or false if error
     */
    static async getAverageVote(levelID) {
        try {
            const [rows] = await db_proxy_1.default.query("SELECT stars FROM diffVote WHERE levelID = ?", [levelID]);
            // Calculate average stars from all votes
            const starsArray = rows.map(row => row.stars);
            const averageStars = Math.round(starsArray.reduce((acc, val) => acc + val, 0) / starsArray.length);
            return averageStars;
        }
        catch (error) {
            console_api_1.default.Error("main", `getAverageVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return false;
        }
    }
    /**
     * Count the number of votes for a level
     * @param levelID - Level ID
     * @returns Vote count
     */
    static async votesCount(levelID) {
        try {
            const query = "SELECT COUNT(*) AS count FROM diffVote WHERE levelID = ?";
            const [rows] = await db_proxy_1.default.execute(query, [levelID]);
            return rows[0].count;
        }
        catch (error) {
            console_api_1.default.Error("main", `votesCountException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
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
    static async vote(levelID, accountID, stars) {
        try {
            const query = "INSERT INTO diffVote (levelID, accountID, stars, timestamp) VALUES (?, ?, ?, ?)";
            await db_proxy_1.default.execute(query, [
                levelID,
                accountID,
                stars,
                Math.floor(Date.now() / 1000)
            ]);
            return true;
        }
        catch (error) {
            console_api_1.default.Error("main", `voteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return false;
        }
    }
}
exports.default = DiffLib;
