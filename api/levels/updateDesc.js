'package net.fimastgd.forevercore.api.levels.updateDesc';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const updateDesc = async (accountIDStr, gjp2Str, gjpStr, levelIDStr, levelDescStr, udidStr, req) => {
    // console.log(accountIDStr, gjp2Str, gjpStr, levelIDStr, levelDescStr, udidStr);
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        let levelDesc = ExploitPatch.remove(levelDescStr);
        const levelID = ExploitPatch.remove(levelIDStr);
        let id;

        if (udidStr) {
            id = ExploitPatch.remove(udidStr);
            if (!isNaN(id)) {
                return res.send("-1");
            }
        } else {
            id = await GJPCheck.getAccountIDOrDie();
        }

        let rawDesc = await Buffer.from(levelDesc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");

        if (rawDesc.includes("<c")) {
            const openTags = (rawDesc.match(/<c/g) || []).length;
            const closeTags = (rawDesc.match(/<\/c>/g) || []).length;

            if (openTags > closeTags) {
                rawDesc += "</c>".repeat(openTags - closeTags);
                //levelDesc = await Buffer.from(rawDesc).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
            }
            levelDesc = await Buffer.from(rawDesc).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
        }
        // console.log(levelDesc, levelID, id);
        const [result] = await db.execute("UPDATE levels SET levelDesc = ? WHERE levelID = ? AND extID = ?", [levelDesc, levelID, id]);
		ConsoleApi.Log("main", `Updated level desc: ${levelID}`);
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levela.updateDesc`);
        return "-1";
    }
};

module.exports = updateDesc;
