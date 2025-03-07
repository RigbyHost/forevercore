'package net.fimastgd.forevercore.panel.accounts.changeUsername';

const db = require("../../serverconf/db");
const ConsoleApi = require("../../modules/console-api");

const changeUsername = async (newusr, userName) => {
	try {
		if (newusr.length > 20) {
			ConsoleApi.Log("main", `Panel action: new username "${newusr}" more than 20 symbols`);
			return "-2";
		} 
		if (newusr.length < 3) {
			ConsoleApi.Log("main", `Panel action: new username "${newusr}" less than 3 symbols`);
			return "-3";
		}
		const [result] = await db.execute(
			"UPDATE accounts SET username = ? WHERE userName = LOWER(?)",
			[newusr, userName]
		);
		ConsoleApi.Log("main", `Panel action: username changed (${username} => ${newusr})`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changeUsername`);
	}
};

module.exports = changeUsername;