'package net.fimastgd.forevercore.api.packs.lists.deleteList';

const db = require("../../../serverconf/db");
const ExploitPatch = require("../../lib/exploitPatch");
const ApiLib = require("../../lib/apiLib");
const GJPCheck = require("../../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../../modules/console-api");

const deleteList = async (req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const listID = await ExploitPatch.number(req.body.listID);
        if (isNaN(listID) || accountID != await ApiLib.getListOwner(listID)) {
            return "-1";
        }
        const [result] = await db.execute('DELETE FROM lists WHERE listID = ?', [listID]);
        ConsoleApi.Log("main", `List ${listID} deleted by accountID: ${accountID}`);
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.deleteList`);
        return "-1";
    }
};

module.exports = deleteList;