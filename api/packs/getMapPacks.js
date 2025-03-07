'package net.fimastgd.forevercore.api.packs.getMapPacks';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GenerateHash = require("../lib/generateHash");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getMapPacks = async (req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        const page = await ExploitPatch.remove(req.body.page);
        const packpage = page * 10;
        let mappackstring = "";
        let lvlsmultistring = "";
        const [result] = await db.query(
            "SELECT colors2,rgbcolors,ID,name,levels,stars,coins,difficulty FROM `mappacks` ORDER BY `ID` ASC LIMIT 10 OFFSET ?",
            [packpage]
            );
            const packcount = result.length;
            for (const mappack of result) {
                lvlsmultistring += `${mappack.ID},`;
                let colors2 = mappack.colors2;
                if (colors2 == "none" || colors2 == "") {
                    colors2 = mappack.rgbcolors;
                }
                mappackstring += `1:${mappack.ID}:2:${mappack.name}:3:${mappack.levels}:4:${mappack.stars}:5:${mappack.coins}:6:${mappack.difficulty}:7:${mappack.rgbcolors}:8:${colors2}|`;
            }
            const [totalPackCountResult] = await db.query("SELECT count(*) as count FROM mappacks");
            const totalpackcount = totalPackCountResult[0].count;
            mappackstring = mappackstring.slice(0, -1);
            lvlsmultistring = lvlsmultistring.slice(0, -1);
            const response = `${mappackstring}#${totalpackcount}:${packpage}:10#${await GenerateHash.genPack(lvlsmultistring)}`;
            ConsoleApi.Log("main", `Received MapPack chunk mpch.0.${page}`);
            return response;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getMapPacks`);
        return "-1";
    }
};

module.exports = getMapPacks;