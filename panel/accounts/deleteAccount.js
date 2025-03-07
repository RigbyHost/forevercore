'package net.fimastgd.forevercore.panel.accounts.deleteAccount';

const db = require("../../serverconf/db");
const fs = require('fs').promises;
const path = require('path');
const c = require('ansi-colors');

const ConsoleApi = require("../../modules/console-api");

async function deleteAccount(accountID) {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        return fDate;
    }
    try {
        await db.query('DELETE FROM accounts WHERE accountID = ?', [accountID]);
        const [rows] = await db.query('SELECT * FROM users WHERE extID = ?', [accountID]);
        if (rows.length > 0) {
            await db.query('DELETE FROM users WHERE extID = ?', [accountID]);
        }
        const accountPath = path.join(__dirname, '../../data/accounts', `${accountID.toString()}.dat`);
        const keysPath = path.join(__dirname, '../../data/accounts/keys', `accountID.toString()`);
        await fs.unlink(accountPath).catch(err => {
            if (err.code !== 'ENOENT') throw err;
        });
        await fs.unlink(keysPath).catch(err => {
            if (err.code !== 'ENOENT') throw err;
        });
		ConsoleApi.Log("main", `Panel action: deleted account. accountID: ${accountID}`);
		return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} net.fimastgd.forevercore.panel.accounts.deleteAccount`);
        return "-1";
    }
}

module.exports = deleteAccount;