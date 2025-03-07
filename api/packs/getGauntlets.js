'package net.fimastgd.forevercore.api.packs.getGauntlets';

const db = require("../../serverconf/db");
const GenerateHash = require("../lib/generateHash");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getGauntlets = async () => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        let gauntletstring = "";
        let string = "";
        const [result] = await db.query("SELECT ID,level1,level2,level3,level4,level5 FROM gauntlets WHERE level5 != '0' ORDER BY ID ASC");
        for (const gauntlet of result) {
            const lvls = `${gauntlet.level1},${gauntlet.level2},${gauntlet.level3},${gauntlet.level4},${gauntlet.level5}`;
            gauntletstring += `1:${gauntlet.ID}:3:${lvls}|`;
            string += gauntlet.ID + lvls;
        }
        gauntletstring = gauntletstring.slice(0, -1);
        let RESPONSE = "";
        RESPONSE += gauntletstring;
        RESPONSE += "#" + (await GenerateHash.genSolo2(string));
        ConsoleApi.Log("main", "Received gauntlets chunks");
        return RESPONSE;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getGauntlets`);
        return "-1";
    }
};

module.exports = getGauntlets;