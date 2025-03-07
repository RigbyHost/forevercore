'package net.fimastgd.forevercore.api.comments.uploadComments';

const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const CommandLib = require("../lib/commandLib");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const uploadComment = async (userNameStr, gameVersionStr, commentStr, levelIDStr, percentStr, udidStr, accountIDStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const userName = userNameStr ? await ExploitPatch.remove(userNameStr) : "";
        const gameVersion = gameVersionStr ? await ExploitPatch.number(gameVersionStr) : 0;
        let comment = await ExploitPatch.remove(commentStr);
        comment = gameVersion < 20 ? Buffer.from(comment).toString("base64") : comment;
        const levelID = (levelIDStr < 0 ? "-" : "") + (await ExploitPatch.number(levelIDStr));
        const percent = percentStr ? await ExploitPatch.remove(percentStr) : 0;

        let id = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        id = parseInt(id);
        const register = !isNaN(id);
        const userID = await ApiLib.getUserID(id, userName);
        const uploadDate = Math.floor(Date.now() / 1000);
        const decodecomment = Buffer.from(comment, "base64").toString("utf-8");

        if ((await CommandLib.doCommands(id, decodecomment, levelID)) == true) {
            const reslt = gameVersion > 20 ? "temp_0_<cg>Command completed successfully!</c>" : "-1";
            return reslt;
        } else if ((await CommandLib.doCommands(id, decodecomment, levelID)) == "NO") {
            const resltNO = gameVersion > 20 ? "temp_0_<cr>No permissions</c>" : "-1";
            return resltNO;
        }
        if (id != "" && comment != "") {
            const [result] = await db.execute("INSERT INTO comments (userName, comment, levelID, userID, timeStamp, percent) VALUES (?, ?, ?, ?, ?, ?)", [userName, comment, levelID, userID, uploadDate, percent]);
            //res.send("1");
            if (register && percent != 0) {
                const [rows] = await db.execute("SELECT percent FROM levelscores WHERE accountID = ? AND levelID = ?", [id, levelID]);

                if (rows.length == 0) {
                    await db.execute("INSERT INTO levelscores (accountID, levelID, percent, uploadDate) VALUES (?, ?, ?, ?)", [id, levelID, percent, uploadDate]);
                } else if (rows[0].percent < percent) {
                    await db.execute("UPDATE levelscores SET percent = ?, uploadDate = ? WHERE accountID = ? AND levelID = ?", [percent, uploadDate, id, levelID]);
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

module.exports = uploadComment;
