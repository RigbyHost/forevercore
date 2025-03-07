'package net.fimastgd.forevercore.api.levels.deleteLevelUser';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const ApiLib = require("../lib/apiLib");
const fs = require("fs").promises;
const path = require("path");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const deleteLevelUser = async (levelIDStr, accountIDStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const levelID = await ExploitPatch.remove(levelIDStr);
        const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        if (!Number.isInteger(Number(levelID))) {
			ConsoleApi.Log("main", `Failed to delete level ${levelID}: levelID is not a number`);
            return "-1";
        }

        const userID = await ApiLib.getUserID(accountID);
        const [result] = await db.execute("DELETE from levels WHERE levelID = ? AND userID = ? AND starStars = 0 LIMIT 1", [levelID, userID]);
        await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES (?, ?, ?, ?)", [8, levelID, Math.floor(Date.now() / 1000), userID]);
        const levelPath = path.join(__dirname, "..", "..", "data", "levels", `${levelID}.dat`);
        const deletedLevelPath = path.join(__dirname, "..", "..", "data", "levels", "deleted", `${levelID}.dat`);
        if (
            (await fs
                .access(levelPath)
                .then(() => true)
                .catch(() => false)) &&
            result.affectedRows != 0
        ) {
            await fs.rename(levelPath, deletedLevelPath);
        }
        ConsoleApi.Log("main", `Deleted level ${levelID}`);
        return "1";
    } catch (error) {
		ConsoleApi.Error(`${error} at net.fimastgd.forevercore.api.levels.deleteLevelUser`);
        return "-1";
    }
};

module.exports = deleteLevelUser;
