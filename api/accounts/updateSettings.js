'package net.fimastgd.forevercore.api.accounts.updateSettings';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");
const ConsoleApi = require("../../modules/console-api");

const updateSettings = async (accountIDStr, gjp2Str, gjpStr, mSStr, frSStr, cSStr, ytStr, xStr, twitchStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        if (!accountIDStr) throw new Error("accountID is not defined");
        const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        const mS = mSStr ? (await ExploitPatch.remove(mSStr)) : 0;
        const frS = frSStr ? (await ExploitPatch.remove(frSStr)) : 0;
        const cS = cSStr ? (await ExploitPatch.remove(cSStr)) : 0;
        const youtubeurl = ytStr ? (await ExploitPatch.remove(ytStr)) : "";
        const x = xStr ? (await ExploitPatch.remove(xStr)) : ""; // new policy
        const twitch = twitchStr ? (await ExploitPatch.remove(twitchStr)) : "";

        const query = "UPDATE accounts SET mS = ?, frS = ?, cS = ?, youtubeurl = ?, twitter = ?, twitch = ? WHERE accountID = ?";
        await db.execute(query, [mS, frS, cS, youtubeurl, x, twitch, accountID]);
        ConsoleApi.Log("main", `User profile settings updated in accountID: ${accountID}`);
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.accounts.updateSettings`);
        return "-1";
    }
};

module.exports = updateSettings;