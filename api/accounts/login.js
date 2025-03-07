'package net.fimastgd.forevercore.api.accounts.login';

const GeneratePass = require("../lib/generatePass");
const ApiLib = require("../lib/apiLib");
const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");
const mysql = require("mysql2/promise");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const loginAccount = async (userNameOr, udidOr, passwordOr, gjp2Or, req) => {
    try {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }

    const ip = await ApiLib.getIP(req);
    const udid = await ExploitPatch.remove(udidOr);
    const userName = await ExploitPatch.remove(userNameOr);

    // Registering
    const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName LIKE ?", [userName]);

    if (rows.length === 0) {
        // console.log('-1 (1st)');
        console.log(c.red(`[${dateNow()}] [main/ERROR]: Failed login to account (Username is invalid): ${userName}`));
        return "-1";
    }

    const id = rows[0].accountID;

    let pass = 0;
    if (passwordOr) {
        pass = await GeneratePass.isValidUsrname(userName, passwordOr, req);
    } else if (gjp2Or) {
        pass = await GeneratePass.isGJP2ValidUsrname(userName, gjp2Or, req);
    }

    if (pass == 1) {
        // success
        const [rows2] = await db.execute("SELECT userID FROM users WHERE extID = ?", [id]);

        let userID;
        if (rows2.length > 0) {
            userID = rows2[0].userID;
        } else {
            const [result3] = await db.execute("INSERT INTO users (isRegistered, extID, userName) VALUES (1, ?, ?)", [id, userName]);
            userID = result3.insertId;
        }

        // logging
        await db.execute("INSERT INTO actions (type, value, timestamp, value2) VALUES ('2', ?, ?, ?)", [userName, Math.floor(Date.now() / 1000), ip]);

        ConsoleApi.Log("main", `Logged to account: ${userName}`);
        return `${id},${userID}`;
        // result?
        if (isNaN(udid)) {
            const [rows4] = await db.execute("SELECT userID FROM users WHERE extID = ?", [udid]);
            const usrid2 = rows4[0].userID;
            await db.execute("UPDATE levels SET userID = ?, extID = ? WHERE userID = ?", [userID, id, usrid2]);
        }
    } else if (pass == -1) {
        // failure
        ConsoleApi.Log("main", `Failed login to account (Invalid password): ${userName}`);
        return "-12";
    } else {
        ConsoleApi.Log("main", `Failed login to account (Failed to check pass): ${userName}`);
        return "-1";
    }
    } catch (error) {
		ConsoleApi.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.login");
		ConsoleApi.FatalError("main", `Unhandled server exception with user login to account, automatic protection called at net.fimastgd.forevercore.api.accounts.login\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.login`);
		return "-1";
    }
};

module.exports = loginAccount;
