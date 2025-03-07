'package net.fimastgd.forevercore.api.other.topArtists';

const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");

const ConsoleApi = require("../../modules/console-api");

const topArtists = async (pageStr) => {
	try {
    let offset;
    if (pageStr && pageStr != "") {
        offset = await ExploitPatch.number(pageStr);
        offset = offset * 2; // без комментариев.
    } else {
        offset = 0;
    }
    const querywhat = `SELECT authorName, download FROM songs WHERE (authorName NOT LIKE '%Reupload%' AND authorName NOT LIKE 'unknown') GROUP BY authorName ORDER BY COUNT(authorName) DESC LIMIT 20 OFFSET ${offset}`;
    const [res] = await db.query(querywhat);
    const [countResult] = await db.query("SELECT count(DISTINCT(authorName)) FROM songs WHERE (authorName NOT LIKE '%Reupload%' AND authorName NOT LIKE 'unknown')");
    const totalCount = countResult[0]["count(DISTINCT(authorName))"];
    let str = "";
    for (const sel of res) {
        str += `4:${sel.authorName}`;

        if (sel.download.startsWith("https://api.soundcloud.com")) { // not work now
            if (encodeURIComponent(sel.authorName).includes("+")) {
                str += `:7:../redirect?q=https%3A%2F%2Fsoundcloud.com%2Fsearch%2Fpeople?q=${sel.authorName}`;
            } else {
                str += `:7:../redirect?q=https%3A%2F%2Fsoundcloud.com%2F${sel.authorName}`;
            }
        }
        str += "|";
    }
    str = str.slice(0, -1); // удаление последнего "|"
    str += `#${totalCount}:${offset}:20`;
    return str;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.other.topArtists`);
		return "-1";
	}
};

module.exports = topArtists;
