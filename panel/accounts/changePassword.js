'package net.fimastgd.forevercore.panel.accounts.changePassword';

const bcrypt = require('bcrypt');
const { KeyProtectedByPassword, Crypto } = require('defuse');
const fs = require('fs').promises;
const path = require('path');
const c = require('ansi-colors');
const db = require("../../serverconf/db");
const ExploitPatch = require("../../api/lib/exploitPatch");
const GeneratePass = require("../../api/lib/generatePass");

const ConsoleApi = require("../../modules/console-api");


async function changePassword(req) {
	function dateNow() {
    const currentDate = new Date();
    const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    return fDate;
}
  const { userName, oldpassword, newpassword, accid } = req.body;
  const salt = "";

  const pass = await GeneratePass.isValidUsrname(userName, oldpassword, req);
  if (pass == 1) {
    const passhash = await bcrypt.hash(newpassword, 10);
    try {
      await db.query("UPDATE accounts SET password=?, salt=? WHERE userName=?", [passhash, salt, userName]);
      await GeneratePass.assignGJP2(accid, newpassword, req);

      const [rows] = await db.query("SELECT accountID FROM accounts WHERE userName=?", [userName]);
      const accountID = rows[0].accountID;
      const accountIDPS = accountID.toString();
      const saveDataPath = path.join(__dirname, '../../data/accounts', `${accountIDPS}.dat`);
      const saveData = await fs.readFile(saveDataPath, 'utf8');

      const keyPath = path.join(__dirname, '../../data/accounts/keys', accountIDPS);
      if (await fs.access(keyPath).then(() => true).catch(() => false)) {
        const protected_key_encoded = await fs.readFile(keyPath, 'utf8');
        if (protected_key_encoded) {
          const protected_key = KeyProtectedByPassword.loadFromAsciiSafeString(protected_key_encoded);
          const user_key = await protected_key.unlockKey(oldpassword);
          const decryptedSaveData = await Crypto.decrypt(saveData, user_key);
          await fs.writeFile(saveDataPath, decryptedSaveData, 'utf8');
          await fs.writeFile(keyPath, '', 'utf8');
        }
      }
      ConsoleApi.Log("main", `Panel action: changed password in account ${userName}`);
      return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.main`);
		return "1";
    }
  } else {
    return "-1";
  }
}

module.exports = changePassword;

