'package net.fimastgd.forevercore.api.rewards.getChests';

const db = require("../../serverconf/db");
const { bigChest, smallChest } = require("../../serverconf/chests");
const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const XORCipher = require("../lib/XORCipher");
const GenerateHash = require("../lib/generateHash");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getChests = async (chkStr, rewardTypeStr, udidStr, accountIDStr, gameVersionStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const extID = await ApiLib.getIDFromPost(udidStr, gameVersionStr, accountIDStr, gjp2Str, gjpStr, req);
        const chk = await ExploitPatch.remove(chkStr);
        const rewardType = await ExploitPatch.remove(rewardTypeStr);
        const userid = await ApiLib.getUserID(extID);
        const udid = await ExploitPatch.remove(udidStr);
        const accountID = await ExploitPatch.remove(accountIDStr);
        const decodedChk = await XORCipher.cipher(Buffer.from(chk.substr(5), "base64"), 59182);

        const [user] = await db.query("SELECT chest1time, chest1count, chest2time, chest2count FROM users WHERE extID = ?", [extID]);

        // rewards
        // Time left
        let currenttime = Math.floor(Date.now() / 1000) + 100;
        let chest1time = user[0].chest1time;
        let chest1count = user[0].chest1count;
        let chest2time = user[0].chest2time;
        let chest2count = user[0].chest2count;
        let chest1diff = currenttime - chest1time;
        let chest2diff = currenttime - chest2time;

        const chest1items = smallChest.items;
        const chest2items = bigChest.items;
        const chest1minOrbs = smallChest.minOrbs;
        const chest1maxOrbs = smallChest.maxOrbs;
        const chest1minDiamonds = smallChest.minDiamonds;
        const chest1maxDiamonds = smallChest.maxDiamonds;
        const chest1minKeys = smallChest.minKeys;
        const chest1maxKeys = smallChest.maxKeys;
        const chest2minOrbs = bigChest.minOrbs;
        const chest2maxOrbs = bigChest.maxOrbs;
        const chest2minDiamonds = bigChest.minDiamonds;
        const chest2maxDiamonds = bigChest.maxDiamonds;
        const chest2minKeys = bigChest.minKeys;
        const chest2maxKeys = bigChest.maxKeys;
        const chest1wait = smallChest.wait;
        const chest2wait = bigChest.wait;

        // stuff
        const chest1stuff = `${Math.floor(Math.random() * (chest1maxOrbs - chest1minOrbs + 1) + chest1minOrbs)},${Math.floor(Math.random() * (chest1maxDiamonds - chest1minDiamonds + 1) + chest1minDiamonds)},${chest1items[Math.floor(Math.random() * chest1items.length)]},${Math.floor(Math.random() * (chest1maxKeys - chest1minKeys + 1) + chest1minKeys)}`;
        const chest2stuff = `${Math.floor(Math.random() * (chest2maxOrbs - chest2minOrbs + 1) + chest2minOrbs)},${Math.floor(Math.random() * (chest2maxDiamonds - chest2minDiamonds + 1) + chest2minDiamonds)},${chest2items[Math.floor(Math.random() * chest2items.length)]},${Math.floor(Math.random() * (chest2maxKeys - chest2minKeys + 1) + chest2minKeys)}`;

        let chest1left = Math.max(0, chest1wait - chest1diff);
        let chest2left = Math.max(0, chest2wait - chest2diff);

        // reward claiming
        if (rewardType == 1) {
            if (chest1left != 0) {
                return "-1";
            }
            chest1count++;
            await db.query("UPDATE users SET chest1count = ?, chest1time = ? WHERE userID = ?", [chest1count, currenttime, userid]);
            chest1left = chest1wait;
        }
        if (rewardType == 2) {
            if (chest2left != 0) {
                return "-1";
            }
            chest2count++;
            await db.query("UPDATE users SET chest2count = ?, chest2time = ? WHERE userID = ?", [chest2count, currenttime, userid]);
            chest2left = chest2wait;
        }

        const stringToEncode = `1:${userid}:${decodedChk}:${udid}:${accountID}:${chest1left}:${chest1stuff}:${chest1count}:${chest2left}:${chest2stuff}:${chest2count}:${rewardType}`;
        let string = Buffer.from(await XORCipher.cipher(stringToEncode, 59182)).toString("base64");
        string = string.replace(/\//g, "_").replace(/\+/g, "-");
        const hash = await GenerateHash.genSolo4(string);
		ConsoleApi.Log("main", "Received chests");
        return `SaKuJ${string}|${hash}`;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.rewards.getChests`);
        return "-1";
    }
};

module.exports = getChests;
