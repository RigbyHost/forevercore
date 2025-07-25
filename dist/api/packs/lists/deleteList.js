"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../../serverconf/db"));
const exploitPatch_1 = __importDefault(require("../../lib/exploitPatch"));
const apiLib_1 = __importDefault(require("../../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../../modules/console-api"));
/**
 * Deletes a list in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const deleteList = async (req) => {
    try {
        const db = await (0, db_1.default)('main');
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const listID = await exploitPatch_1.default.number(req.body.listID);
        // Check if user owns the list
        if (isNaN(Number(listID)) || String(accountID) !== String(await apiLib_1.default.getListOwner(listID))) {
            return "-1";
        }
        // Delete the list
        const [result] = await db.execute('DELETE FROM lists WHERE listID = ?', [listID]);
        console_api_1.default.Log("main", `List ${listID} deleted by accountID: ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.deleteList`);
        return "-1";
    }
};
exports.default = deleteList;
