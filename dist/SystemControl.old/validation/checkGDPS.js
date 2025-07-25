'package net.fimastgd.forevercore.SystemControl.validation.checkGDPS';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGDPS = checkGDPS;
const man_db_1 = __importDefault(require("../../serverconf/man-db"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
async function checkGDPS(id, node) {
    try {
        const mandb = await man_db_1.default.createConnection("MANDB_PROCESS");
        const [rows] = await mandb.execute(`SELECT * FROM servers
				WHERE serverID = ? AND node = ?`, [id, node]);
        return (rows.length > 0) ? true : false;
    }
    catch (e) {
        console_api_1.default.Error("SystemControl", `${e} at net.fimastgd.forevercore.SystemControl.SystemControl.validation.checkGDPS`);
        return false;
    }
}
