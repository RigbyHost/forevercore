"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../../serverconf/db"));
const exploitPatch_1 = __importDefault(require("../../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../../modules/console-api"));
/**
 * Uploads a list in Geometry Dash
 * @param req - Express request with required parameters
 * @returns List ID if successful, "-100" if bad secret, "-6" if failed, "-9" if invalid account
 */
const uploadList = async (req) => {
    try {
        const db = await (0, db_1.default)('main');
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const listID = parseInt(exploitPatch_1.default.number(req.body.listID));
        // Process list parameters
        const listName = (req.body.listName && await (exploitPatch_1.default.remove(req.body.listName) != ""))
            ? (await exploitPatch_1.default.remove(req.body.listName))
            : "Unnamed List";
        const listDesc = await exploitPatch_1.default.remove(req.body.listDesc);
        const listLevels = await exploitPatch_1.default.remove(req.body.listLevels);
        const difficulty = await exploitPatch_1.default.number(req.body.difficulty);
        const listVersion = parseInt(exploitPatch_1.default.number(req.body.listVersion)) === 0
            ? 1
            : (await exploitPatch_1.default.number(req.body.listVersion));
        const original = await exploitPatch_1.default.number(req.body.original);
        const unlisted = await exploitPatch_1.default.number(req.body.unlisted);
        const secret = await exploitPatch_1.default.remove(req.body.secret);
        // Validate request
        if (secret !== "Wmfd2893gb7")
            return "-100";
        if (listLevels.split(',').length === 0)
            return "-6";
        if (isNaN(Number(accountID)))
            return "-9";
        // Check if updating an existing list
        if (listID !== 0) {
            const [rows] = await db.query('SELECT * FROM lists WHERE listID = ? AND accountID = ?', [listID, accountID]);
            if (rows.length > 0) {
                // Update existing list
                await db.query('UPDATE lists SET listDesc = ?, listVersion = ?, listlevels = ?, starDifficulty = ?, original = ?, unlisted = ?, updateDate = ? WHERE listID = ?', [
                    listDesc,
                    listVersion,
                    listLevels,
                    difficulty,
                    original,
                    unlisted,
                    Math.floor(Date.now() / 1000),
                    listID
                ]);
                return listID.toString();
            }
        }
        // Create new list
        const [result] = await db.query('INSERT INTO lists (listName, listDesc, listVersion, accountID, listlevels, starDifficulty, original, unlisted, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            listName,
            listDesc,
            listVersion,
            accountID,
            listLevels,
            difficulty,
            original,
            unlisted,
            Math.floor(Date.now() / 1000)
        ]);
        console_api_1.default.Log("main", `Uploaded level list: ${listName} (${listID})`);
        return result.insertId.toString();
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.uploadList`);
        return "-6";
    }
};
exports.default = uploadList;
