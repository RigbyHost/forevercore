'package net.fimastgd.forevercore.api.levels.getDailyLevel';

const db = require("../../serverconf/db");
const ConsoleApi = require("../../modules/console-api");

const getDailyLevel = async (typeStr, weeklyStr) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    function getNextMonday() {
        const date = new Date();
        date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));
        date.setHours(0, 0, 0, 0);
        return date;
    }
    function getTomorrow() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);
        return date;
    }
    const type = typeStr || weeklyStr || 0;
    const midnight = type == 1 ? new Date(getNextMonday()) : new Date(getTomorrow());
    const current = Math.floor(Date.now() / 1000);
    try {
        const [rows] = await db.execute("SELECT feaID FROM dailyfeatures WHERE timestamp < ? AND type = ? ORDER BY timestamp DESC LIMIT 1", [current, type]);
        if (rows.length === 0) {
            return "-1";
        }
        let dailyID = rows[0].feaID;
        if (type == 1) dailyID += 100001;
        const timeleft = Math.floor(midnight.getTime() / 1000) - current;
        ConsoleApi.Log("main", `Received daily level. ID: ${dailyID}, timeleft: ${timeleft}`);
        return `${dailyID}|${timeleft}`;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.getDailyLevel`);
        return "-1";
    }
};

module.exports = getDailyLevel;
