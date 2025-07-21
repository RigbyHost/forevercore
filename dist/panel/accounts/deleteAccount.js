'package net.fimastgd.forevercore.panel.accounts.deleteAccount';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Deletes a user account
 * @param accountID - Account ID to delete
 * @returns "1" if successful, "-1" if failed
 */
const deleteAccount = async (accountID) => {
    try {
        // Delete account data from database
        const [accountResult] = await db_proxy_1.default.query('DELETE FROM accounts WHERE accountID = ?', [accountID]);
        // Delete user data if it exists
        const [rows] = await db_proxy_1.default.query('SELECT * FROM users WHERE extID = ?', [accountID]);
        if (rows && rows.length > 0) {
            await db_proxy_1.default.query('DELETE FROM users WHERE extID = ?', [accountID]);
        }
        // Delete account save data files
        const accountPath = path_1.default.join(__dirname, '../../data/accounts', `${accountID.toString()}.dat`);
        const keysPath = path_1.default.join(__dirname, '../../data/accounts/keys', `${accountID.toString()}`);
        // Delete files (ignoring if they don't exist)
        await promises_1.default.unlink(accountPath).catch(err => {
            if (err.code !== 'ENOENT')
                throw err;
        });
        await promises_1.default.unlink(keysPath).catch(err => {
            if (err.code !== 'ENOENT')
                throw err;
        });
        console_api_1.default.Log("main", `Panel action: deleted account. accountID: ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} net.fimastgd.forevercore.panel.accounts.deleteAccount`);
        return "-1";
    }
};
exports.default = deleteAccount;
