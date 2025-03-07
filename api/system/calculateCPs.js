'package net.fimastgd.forevercore.api.system.calculateCPs';

const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const calculate = async () => {
    function dateNow() {
    const currentDate = new Date();
    const fDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    return fDate;
    }
    try {
        let cplog = "";
        const people = {};
        // Getting users
        const query = `
    UPDATE users
	LEFT JOIN
	(
	    SELECT usersTable.userID, (IFNULL(starredTable.starred, 0) + IFNULL(featuredTable.featured, 0) + (IFNULL(epicTable.epic,0)*1)) as CP FROM (
            SELECT userID FROM users
        ) AS usersTable
      LEFT JOIN
        (
	        SELECT count(*) as starred, userID FROM levels WHERE starStars != 0 AND isCPShared = 0 GROUP BY(userID)
	    ) AS starredTable ON usersTable.userID = starredTable.userID
	    LEFT JOIN
	    (
	        SELECT count(*) as featured, userID FROM levels WHERE starFeatured != 0 AND isCPShared = 0 GROUP BY(userID)
	    ) AS featuredTable ON usersTable.userID = featuredTable.userID
	    LEFT JOIN
	    (
	        SELECT count(*)+(starEpic-1) as epic, userID FROM levels WHERE starEpic != 0 AND isCPShared = 0 GROUP BY(userID)
	    ) AS epicTable ON usersTable.userID = epicTable.userID
	) calculated
	ON users.userID = calculated.userID
	SET users.creatorPoints = IFNULL(calculated.CP, 0)
    `;
        await db.query(query);
        // CP SHARING
        const [result] = await db.query("SELECT levelID, userID, starStars, starFeatured, starEpic FROM levels WHERE isCPShared = 1");
        for (const level of result) {
            let deservedcp = 0;
            if (level.starStars != 0) {
                deservedcp++;
            }
            if (level.starFeatured != 0) {
                deservedcp++;
            }
            if (level.starEpic != 0) {
                deservedcp += level.starEpic; // Epic - 1, Legendary - 2, Mythic - 3
            }
            const [shares] = await db.query("SELECT userID FROM cpshares WHERE levelID = ?", [level.levelID]);
            const sharecount = shares.length + 1;
            let addcp = deservedcp / sharecount;
            console.log("dxp:", deservedcp, "addcp:", addcp);
            /*if (level.starEpic != 0) {
                addcp = addcp - 1;
            }*/
            
            for (const share of shares) {
                people[share.userID] = (people[share.userID] || 0)/* + addcp*/;
            }
            //people[level.userID] = (people[level.userID] || 0) + addcp;
        }
        // finish
        for (const [user, cp] of Object.entries(people)) {
            // console.log(cp, ":", cpf);
            await db.query("UPDATE users SET creatorPoints = (creatorpoints + ?) WHERE userID = ?", [cpf, user]);
        }
        return "1";
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.system.calculateCPs`);
        return "-1";
    }
};



module.exports = {
    calculate: calculate
};