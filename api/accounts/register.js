'package net.fimastgd.forevercore.api.accounts.register';

const ExploitPatch = require('../lib/exploitPatch');
const GeneratePass = require('../lib/generatePass');
const bcrypt = require('bcryptjs'); 
const db = require('../../serverconf/db');
const c = require('ansi-colors');
const ConsoleApi = require("../../modules/console-api");
 
const registerAccount = async (userNameStr, passwordStr, emailStr) => {
    try {
    function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
		return fDate;
    }
    if (userNameStr !== "") {
        const userName = await ExploitPatch.remove(userNameStr);
        const password = await ExploitPatch.remove(passwordStr);
        const email = await ExploitPatch.remove(emailStr);
        if (userName.length > 20) {
            ConsoleApi.Log("main", `Failed to register a new account: ${userName} - username too long`);
            return "-4";
        }
        const query2 = 'SELECT count(*) FROM accounts WHERE userName LIKE ?';
        const [rows] = await db.execute(query2, [userName]);
        const regusrs = rows[0]['count(*)'];
        if (regusrs > 0) {
            ConsoleApi.Log("main", `Failed to register a new account: ${userName} - account already exists`);
            return "-2";
        } else {
            const hashpass = await bcrypt.hash(password, 10);
            const gjp2 = await GeneratePass.GJP2hash(password);
            const registerDate = Math.floor(Date.now() / 1000);
            const query = 'INSERT INTO accounts (userName, password, email, registerDate, isActive, gjp2) VALUES (?, ?, ?, ?, ?, ?)';
            await db.execute(query, [userName, hashpass, email, registerDate, 0, gjp2]);
            ConsoleApi.Log("main", `New account registered: ${userName}`);
            return "1";
        }
    }
    } catch (error) {
		ConsoleApi.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.register");
		ConsoleApi.FatalError("main", `Unhandled server exception with user register a new account, automatic protection called at net.fimastgd.forevercore.api.accounts.register\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.register`);
		return "-1";
    }
};


module.exports = registerAccount;
