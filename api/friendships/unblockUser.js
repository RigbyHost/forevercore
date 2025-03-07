'package net.fimastgd.forevercore.api.friendships.unblockUser';

const db = require("../../serverconf/db");
const GJPCheck = require("../lib/GJPCheck");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const unblockUser = async (req) => {
	function dateNow() {
    const currentDate = new Date();
    const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    return fDate;
}
	try {
    if (!req.body.targetAccountID) {
	ConsoleApi.Log("main", "Failed to unblock user: targetAccountID not found");
    return "-1";
    }
  const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
  const targetAccountID = await ExploitPatch.remove(req.body.targetAccountID);

  const query = "DELETE FROM blocks WHERE person1 = ? AND person2 = ?";
  await db.execute(query, [accountID, targetAccountID]);
  ConsoleApi.Log("main", `User ${targetAccountID} unblocked by ${accountID}`);
  return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.unblockUser`);
		return "-1";
	}
};

module.exports = unblockUser;