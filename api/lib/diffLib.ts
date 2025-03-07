'package net.fimastgd.forevercore.api.lib.diffLib';

const db = require("../../serverconf/db");
const settings = require("../../serverconf/settings");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

function dateNow() {
    const currentDate = new Date();
    const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
    return fDate;
}
class DiffLib {
    static async canUserVote(accountID, levelID) {
        try {
            const query = "SELECT COUNT(*) AS count FROM diffVote WHERE accountID = ? AND levelID = ?";
            const [rows] = await db.execute(query, [accountID, levelID]);
            if (rows[0].count > 1) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
			ConsoleApi.Error("main", `canUserVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return false;
        }
    }
    static async getAverageVote(levelID) {
        try {
            const [rows] = await db.query("SELECT stars FROM diffVote WHERE levelID = ?", [levelID]);
            const starsArray = rows.map(row => row.stars);
            const averageStars = Math.round(starsArray.reduce((acc, val) => acc + val, 0) / starsArray.length);
            return averageStars;
        } catch (error) {
			ConsoleApi.Error("main", `getAverageVoteException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return false;
        }
    }
    static async votesCount(levelID) {
        try {
            const query = "SELECT COUNT(*) AS count FROM diffVote WHERE levelID = ?";
            const [rows] = await db.execute(query, [levelID]);
            return rows[0].count;
        } catch (error) {
			ConsoleApi.Error("main", `votesCountException: ${error} at net.fimastgd.forevercore.api.lib.diffLib`);
            return "-1";
        }
    }
    static async vote(levelID, accountID, stars) {
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

module.exports = DiffLib;
