'package net.fimastgd.forevercore.api.accounts.getUserInfo';

const ExploitPatch = require("../lib/exploitPatch");
const ApiLib = require("../lib/apiLib");
const db = require("../../serverconf/db");
const GJPCheck = require("../lib/GJPCheck");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getUserInfo = async (targetAccountIDStr, accountIDStr, gjp2Str, gjpStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        let appendix = "";
        let me;
        const extid = await ExploitPatch.number(targetAccountIDStr);
        if (gjp2Str) {
            me = accountIDStr ? await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, undefined, req) : 0;
            //console.log("gjp2 yeah");
        } else {
            me = accountIDStr ? await GJPCheck.getAccountIDOrDie(accountIDStr, undefined, gjpStr, req) : 0;
        }
        let [rows] = await db.execute("SELECT count(*) as count FROM blocks WHERE (person1 = ? AND person2 = ?) OR (person2 = ? AND person1 = ?)", [extid, me, extid, me]);
        if (rows[0].count > 0) {
            ConsoleApi.Error("main", `Failed to get user info. ID: ${extid}`);
            return "-1";
        }

        [rows] = await db.execute("SELECT * FROM users WHERE extID = ?", [extid]);
        if (rows.length === 0) {
            ConsoleApi.Error("main", `Failed to get user info. ID: ${extid}`);
            return "-1";
        }

        const user = rows[0];
        const creatorpoints = Math.round(user.creatorPoints);

        await db.execute("SET @rownum := 0;");
        [rows] = await db.execute("SELECT count(*) as count FROM users WHERE stars > ? AND isBanned = 0", [user.stars]);
        let rank = rows.length > 0 ? rows[0].count + 1 : 0;
        if (user.isBanned != 0) rank = 0;

        [rows] = await db.execute("SELECT youtubeurl, twitter, twitch, frS, mS, cS FROM accounts WHERE accountID = ?", [extid]);
        let accinfo = rows[0];
        let reqsstate = accinfo.frS;
        let msgstate = accinfo.mS;
        let commentstate = accinfo.cS;
        let badge = await ApiLib.getMaxValuePermission(extid, "modBadgeLevel");

        // async function getUserData(me, extid, user, accinfo, creatorpoints, msgstate, reqsstate, commentstate, rank, badge) {
        let friendstate = 0;

        if (me === extid) {
            const [requests] = await db.execute("SELECT count(*) as count FROM friendreqs WHERE toAccountID = ?", [me]);
            const [pms] = await db.execute("SELECT count(*) as count FROM messages WHERE toAccountID = ? AND isNew=0", [me]);
            const [friends] = await db.execute('SELECT count(*) as count FROM friendships WHERE (person1 = ? AND isNew2 = "1") OR (person2 = ? AND isNew1 = "1")', [me, me]);

            appendix = `:38:${pms[0].count}:39:${requests[0].count}:40:${friends[0].count}`;
        } else {
            const [INCrequests] = await db.execute("SELECT ID, comment, uploadDate FROM friendreqs WHERE accountID = ? AND toAccountID = ?", [extid, me]);
            if (INCrequests.length > 0) {
                const uploaddate = new Date(INCrequests[0].uploadDate * 1000).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                friendstate = 3;
                appendix = `:32:${INCrequests[0].ID}:35:${INCrequests[0].comment}:37:${uploaddate}`;
            }

            const [OUTrequests] = await db.execute("SELECT count(*) as count FROM friendreqs WHERE toAccountID = ? AND accountID = ?", [extid, me]);
            if (OUTrequests[0].count > 0) {
                friendstate = 4;
            }

            const [frs] = await db.execute("SELECT count(*) as count FROM friendships WHERE (person1 = ? AND person2 = ?) OR (person2 = ? AND person1 = ?)", [me, extid, me, extid]);
            if (frs[0].count > 0) {
                friendstate = 1;
            }
        }

        user.extID = isNaN(user.extID) ? 0 : user.extID;
        ConsoleApi.Log("main", `Received user info. ID: ${extid}`);
        return `1:${user.userName}:2:${user.userID}:13:${user.coins}:17:${user.userCoins}:10:${user.color1}:11:${user.color2}:51:${user.color3}:3:${user.stars}:46:${user.diamonds}:52:${user.moons}:4:${user.demons}:8:${creatorpoints}:18:${msgstate}:19:${reqsstate}:50:${commentstate}:20:${accinfo.youtubeurl}:21:${user.accIcon}:22:${user.accShip}:23:${user.accBall}:24:${user.accBird}:25:${user.accDart}:26:${user.accRobot}:28:${user.accGlow}:43:${user.accSpider}:48:${user.accExplosion}:53:${user.accSwing}:54:${user.accJetpack}:30:${rank}:16:${user.extID}:31:${friendstate}:44:${accinfo.twitter}:45:${accinfo.twitch}:49:${badge}:55:${user.dinfo}:56:${user.sinfo}:57:${user.pinfo}${appendix}:29:1`;
    } catch (err) {
		ConsoleApi.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.getUserInfo`);
        return "-1";
    }
};

module.exports = getUserInfo;
