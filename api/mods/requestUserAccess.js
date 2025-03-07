'package net.fimastgd.forevercore.api.mods.requestUserAccess';

const ApiLib = require("../lib/apiLib");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const requestUserAccess = async (accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        let permstate;
        const accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        if ((await ApiLib.getMaxValuePermission(accountID, "actionRequestMod")) >= 1) {
            permState = await ApiLib.getMaxValuePermission(accountID, "modBadgeLevel");
            if (permState >= 2) {
				ConsoleApi.Log("main", `Elder Moderator or else granted to accountID: ${accountID}`);
                return "2";
            }
            ConsoleApi.Log("main", `Moderator or else granted to accountID: ${accountID}`);
            return "1";
        }
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.mods.requestUserAccess`);
        return "-1";
    }
};

module.exports = requestUserAccess;
