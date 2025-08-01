'package net.fimastgd.forevercore.api.accounts.backup';

const path = require("path");
const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const fs = require("fs").promises;
const GeneratePass = require("../lib/generatePass");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

let userNameFin;
const backupAccount = async (userNameOr, passwordOr, saveDataOr, accountIDOr, gjp2Or, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        //console.log(`userName: ${userNameOr}\npassword: ${passwordOr}\nsaveData: ${saveDataOr}\naccountID: ${accountIDOr}\n gjp2: ${gjp2Or}\nreq: ${req}`);

        if (typeof setTimeout === "function") {
            setTimeout(() => {}, 0);
        }
        if (typeof userNameOr === "undefined") {
            const [rows] = await db.execute("SELECT userName FROM accounts WHERE accountID = ?", [accountIDOr]);
            userNameOr = rows.length ? rows[0].accountID : null;
            //console.log(`username try 2: ${userNameOr}`);
        }
        if (userNameOr) {
            const userName = await ExploitPatch.remove(userNameOr);
        }
        const password = passwordOr || "";
        const saveData = await ExploitPatch.remove(saveDataOr);

        let accountID;

        if (!accountIDOr) {
            const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
            accountID = rows.length ? rows[0].accountID : null;
        } else {
            accountID = ExploitPatch.remove(accountIDOr);
        }

        if (!isFinite(accountID)) {
            //console.log("return -1 1st");
            ConsoleApi.Log("main", `Failed to backup account: ${accountID}`);
            return "-1";
        }

        let pass = 0;

        if (passwordOr) {
            pass = await GeneratePass.isValid(accountIDOr, passwordOr, req);
        } else if (gjp2Or) {
            pass = await GeneratePass.isGJP2Valid(accountIDOr, gjp2Or, req);
        }

        if (pass === 1) {
            let saveDataArr = saveDataOr.split(";");
            let saveDataDecoded = saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/");
            saveDataDecoded = Buffer.from(saveDataDecoded, "base64");
            saveDataDecoded = require("zlib").gunzipSync(saveDataDecoded).toString();

            let orbs = saveDataDecoded.split("</s><k>14</k><s>")[1].split("</s>")[0];
            let lvls = saveDataDecoded.split("<k>GS_value</k>")[1].split("</s><k>4</k><s>")[1].split("</s>")[0];

            saveDataDecoded = saveDataDecoded.replace(`<k>GJA_002</k><s>${passwordOr}</s>`, "<k>GJA_002</k><s>password</s>");
            saveDataDecoded = require("zlib").gzipSync(saveDataDecoded).toString("base64");
            saveDataDecoded = saveDataDecoded.replace(/\+/g, "-").replace(/\//g, "_");
            saveDataDecoded = saveDataDecoded + ";" + saveDataArr[1];

            // write! (await: path.join,const extID and userNameFin)
            const accountsPath = await path.join("./data/accounts", `${accountIDOr}.dat`);
            const accountsKeyPath = await path.join("./data/accounts/keys", `${accountIDOr}`);
            await fs.writeFile(`${accountsPath}`, saveDataDecoded);
            await fs.writeFile(`${accountsKeyPath}`, "");
            if (userNameOr) {
                const [rows] = await db.execute("SELECT extID FROM users WHERE userName = ? LIMIT 1", [userNameOr]);
                const extID = await rows[0].extID;
            } else {
                const [rows] = await db.execute("SELECT userName FROM users WHERE extID = ? LIMIT 1", [accountIDOr]);
                userNameFin = await rows[0].userName;
                //console.log("finally username:" + userNameFin);
            }

            if (userNameOr) {
                await db.execute("UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE extID = ?", [orbs, lvls, extID]);
            } else {
                await db.execute("UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE userName = ?", [orbs, lvls, userNameFin]);
            }
            //console.log("return 1");
            ConsoleApi.Log("main", `Account backuped. ID: ${accountID}`);
            // console.log(`[${dateNow()}] [main/INFO]: Account backuped. ID: ${accountID}`);
            return "1";
        } else {
            //console.log("return -1 2nd");
            ConsoleApi.Log("main", `Failed to backup account. ID: ${accountID}`);
            return "-1";
        }
    } catch (err) {
        ConsoleApi.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.backup`);
        return "-1";
    }
};
module.exports = backupAccount;
