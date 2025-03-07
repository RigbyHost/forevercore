'package net.fimastgd.forevercore.api.scores.getScores';

const db = require("../../serverconf/db");
const ExploitPatch = require("../lib/exploitPatch");
const GJPCheck = require("../lib/GJPCheck");
const settings = require("../../serverconf/settings");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getScores = async (gameVersionStr, accountIDStr, udidStr, typeStr, countStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        // let userG;
        let stars = 0;
        let count = 0;
        let xi = 0;
        let lbstring = "";
        let halfCount;
        const dateINIT = new Date();
        const date = `${dateINIT.getDate()}-${dateINIT.getMonth() + 1}`;
        let sign;
        let udid;
        if (!gameVersionStr) {
            sign = "< 20 AND gameVersion <> 0";
        } else {
            sign = "> 19";
        }
        let accountID;
        if (accountIDStr) {
            accountID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        } else {
            udid = await ExploitPatch.remove(udidStr);
            if (!isNaN(udid)) {
                return "-1";
            }
            accountID = udid;
        }
        let type = await ExploitPatch.remove(typeStr);

        if (type == "top" || type == "creators" || type == "relative") {
            let query;
            if (type == "top") {
                query = `SELECT * FROM users WHERE isBanned = '0' AND gameVersion ${sign} AND stars > 0 ORDER BY stars DESC LIMIT ${settings.topCount}`;
                await db.query(query);
            }
            if (type == "creators") {
                query = `SELECT * FROM users WHERE isCreatorBanned = '0' AND creatorPoints > 0 ORDER BY creatorPoints DESC LIMIT 100`;
                await db.query(query);
            }

            if (type == "relative") {
                const [rows] = await db.query("SELECT * FROM users WHERE extID = ?", [accountID]);
                const user = rows[0];
                stars = user.stars;

                let count = typeof countStr !== "undefined" ? ExploitPatch.remove(countStr) : 50;
                halfCount = Math.floor(count / 2);

// MariaDB required! 
                query = `
    SELECT *
    FROM (
      (
        SELECT *
        FROM users
        WHERE stars <= ?
          AND isBanned = 0
          AND gameVersion ${sign}
        ORDER BY stars DESC
        LIMIT ?
      )
      UNION
      (
        SELECT *
        FROM users
        WHERE stars >= ?
          AND isBanned = 0
          AND gameVersion ${sign}
        ORDER BY stars ASC
        LIMIT ?
      )
    ) AS A
    ORDER BY A.stars DESC
  `;
            }
            const [result] = await db.query(query, [stars, halfCount, stars, halfCount]);
            // TEST
            if (type === "relative") {
                const user = result[0];
                const extid = user.extID;
                await db.query("SET @rownum := 0;");
                const [leaderboard] = await db.query(
                    `
        SELECT rank, stars FROM (
            SELECT @rownum := @rownum + 1 AS rank, stars, extID, isBanned
            FROM users WHERE isBanned = '0' AND gameVersion > 19 ORDER BY stars DESC
        ) as result WHERE extID = ?`,
                    [extid]
                );
                const leaderboardData = leaderboard[0];
                xi = leaderboardData.rank - 1;
            }

            for (const user of result) {
                xi++;
                const extid = isNaN(user.extID) ? 0 : user.extID;
                if (date === "01-04") {
                    lbstring += `1:ForeverTop:2:${user.userID}:13:999:17:999:6:${xi}:9:9:10:9:11:8:14:1:15:3:16:${extid}:3:999:8:99999:4:999:7:${extid}:46:99999|`;
                } else {
                    lbstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:51:${user.color3}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.round(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}:52:${user.moons}|`;
                }
            }
        }
        if (type == "friends") {
            const query4 = "SELECT * FROM friendships WHERE person1 = ? OR person2 = ?";
            const [result1] = await db.execute(query4, [accountID, accountID]);

            let people = "";
            for (const friendship of result1) {
                let person = friendship.person1;
                if (friendship.person1 == accountID) {
                    person = friendship.person2;
                }
                people += "," + person;
            }

            const query5 = `SELECT * FROM users WHERE extID IN (? ${people}) ORDER BY stars DESC`;
            const [result2] = await db.execute(query5, [accountID]);

            for (const user of result2) {
                let extid = isNaN(user.extID) ? 0 : user.extID;
                xi++;

                if (date === "01-04") {
                    lbstring += `1:RobNotFriend:2:${user.userID}:13:999:17:999:6:${xi}:9:9:10:9:11:8:14:1:15:3:16:${extid}:3:999:8:99999:4:999:7:${extid}:46:99999|`;
                } else {
                    lbstring += `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:6:${xi}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${extid}:46:${user.diamonds}|`;
                }
            }
        }

        if (lbstring === "") {
            return "-1";
        }
        lbstring = lbstring.slice(0, -1);
        ConsoleApi.Log("main", `Received scores by accountID: ${accountID}`);
        return lbstring;
    } catch (err) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.scores.getScores`);
		return "-1";
    }
};

module.exports = getScores;
