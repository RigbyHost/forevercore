'package net.fimastgd.forevercore.api.levels.reportLevel';

const db = require("../../serverconf/db");
const FixIp = require("../lib/fixIp");
const ExploitPatch = require("../lib/exploitPatch");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const reportLevel = async (levelIDStr, req) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    if (levelIDStr) {
        const levelID = await ExploitPatch.remove(levelIDStr);
        const ip = await FixIp.getIP(req);
        try {
            const [rows] = await db.execute("SELECT COUNT(*) AS count FROM reports WHERE levelID = ? AND hostname = ?", [levelID, ip]);

            if (rows[0].count == 0) {
                const [result] = await db.execute("INSERT INTO reports (levelID, hostname) VALUES (?, ?)", [levelID, ip]);
                return result.insertId.toString();
            } else {
				ConsoleApi.Log("main", `Failed to report level: report from this IP already exists`);
                return "-1";
            }
        } catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.reportLevel`);
            return "-1";
        }
    } else {
		ConsoleApi.Log("main", `Failed to report unknown level`);
        return "-1";
    }
};

module.exports = reportLevel;
