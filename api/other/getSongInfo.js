'package net.fimastgd.forevercore.api.other.getSongInfo';

const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");
const c = require("ansi-colors");

const ConsoleApi = require("../../modules/console-api");

const getSongInfo = async (songIDStr) => {
	try {
    if (!songIDStr) {
        return "-1";
    }
    const songid = await ExploitPatch.remove(songIDStr);
    const [rows] = await db.execute("SELECT ID, name, authorID, authorName, size, isDisabled, download FROM songs WHERE ID = ? LIMIT 1", [songid]);
    if (rows.length === 0) {
        return "-1";
    }
    const result4 = rows[0];
    if (result4.isDisabled == 1) {
        return "-2";
    }
    let dl = result4.download;
    if (dl.includes(":")) {
        dl = encodeURIComponent(dl);
    }
    const response = `1~|~${result4.ID}~|~2~|~${result4.name}~|~3~|~${result4.authorID}~|~4~|~${result4.authorName}~|~5~|~${result4.size}~|~6~|~~|~10~|~${dl}~|~7~|~~|~8~|~0`;
    return response;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.other.getSongInfo`);
	}
};

module.exports = getSongInfo;
