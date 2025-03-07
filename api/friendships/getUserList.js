'package net.fimastgd.forevercore.api.friendships.getUserList';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getUserList = async (req) => {
	function dateNow() {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
		return fDate;
	}
	try {
		if (!req.body.type || isNaN(req.body.type)) {
			ConsoleApi.Log("main", "Failed to get user list: req.body.type not a number or not defined");
			return "-1";
		}
		const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
		const type = await ExploitPatch.remove(req.body.type);
		let people = "";
		let peoplestring = "";
		const newMap = new Map();
		let query;
		if (type == 0) {
			query = "SELECT person1,isNew1,person2,isNew2 FROM friendships WHERE person1 = ? OR person2 = ?";
		} else if (type == 1) {
			query = "SELECT person1,person2 FROM blocks WHERE person1 = ?";
		}
		const [result] = await db.query(query, [accountID, accountID]);
		if (result.length === 0) {
			ConsoleApi.Log("main", `User list is empty. accountID: ${accountID}`);
			return "-2";
		}
		for (const friendship of result) {
			let person = friendship.person1;
			let isnew = friendship.isNew1;
			if (friendship.person1 == accountID) {
				person = friendship.person2;
				isnew = friendship.isNew2;
			}
			newMap.set(person, isnew);
			people += person + ",";
		}
		people = people.slice(0, -1);
		const [users] = await db.query("SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID IN (?) ORDER BY userName ASC", [people.split(",")]);
		for (const user of users) {
			user.extID = !isNaN(user.extID) ? user.extID : 0;
			peoplestring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${user.extID}:18:0:41:${newMap.get(user.extID)}|`;
		}
		peoplestring = peoplestring.slice(0, -1);
		await db.query("UPDATE friendships SET isNew1 = '0' WHERE person2 = ?", [accountID]);
		await db.query("UPDATE friendships SET isNew2 = '0' WHERE person1 = ?", [accountID]);
		if (peoplestring == "") {
			ConsoleApi.Log("main", `Failed to get user list: peoplestring is empty. accountID: ${accountID}`);
			return "-1";
		}
		ConsoleApi.Log("main", `Received user list. accountID: ${accountID}`);
		return peoplestring;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getUserList`);
		return "-1";
	}
};

module.exports = getUserList;