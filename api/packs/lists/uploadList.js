'package net.fimastgd.forevercore.api.packs.lists.uploadList';

const db = require("../../../serverconf/db");
const ExploitPatch = require("../../lib/exploitPatch");
const GJPCheck = require("../../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../../modules/console-api");

const uploadList = async (req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const listID = await ExploitPatch.number(req.body.listID);
        const listName = (req.body.listName && await (ExploitPatch.remove(req.body.listName) != "")) ? (await ExploitPatch.remove(req.body.listName)) : "Unnamed List";
        const listDesc = await ExploitPatch.remove(req.body.listDesc);
        const listLevels = await ExploitPatch.remove(req.body.listLevels);
        const difficulty = await ExploitPatch.number(req.body.difficulty);
        const listVersion = await ExploitPatch.number(req.body.listVersion) === 0 ? 1 : (await ExploitPatch.number(req.body.listVersion));
        const original = await ExploitPatch.number(req.body.original);
        const unlisted = await ExploitPatch.number(req.body.unlisted);
        const secret = await ExploitPatch.remove(req.body.secret);
        if (secret !== "Wmfd2893gb7") return "-100";
        if (listLevels.split(',').length === 0) return "-6";
        if (isNaN(accountID)) return "-9";
        if (listID !== 0) {
            const [rows] = await db.query('SELECT * FROM lists WHERE listID = ? AND accountID = ?', [listID, accountID]);
            if (rows.length > 0) {
                await db.query('UPDATE lists SET listDesc = ?, listVersion = ?, listlevels = ?, starDifficulty = ?, original = ?, unlisted = ?, updateDate = ? WHERE listID = ?',
                [listDesc, listVersion, listLevels, difficulty, original, unlisted, Math.floor(Date.now() / 1000), listID]);
                return listID.toString();
            }
        }
        const [result] = await db.query('INSERT INTO lists (listName, listDesc, listVersion, accountID, listlevels, starDifficulty, original, unlisted, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [listName, listDesc, listVersion, accountID, listLevels, difficulty, original, unlisted, Math.floor(Date.now() / 1000)]);
        ConsoleApi.Log("main", `Uploaded level list: ${listName} (${listID})`);
        return result.insertId.toString();
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.uploadList`);
        return "-6";
    }
};

module.exports = uploadList;