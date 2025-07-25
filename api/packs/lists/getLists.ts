"package net.fimastgd.forevercore.api.packs.lists.getLists";

import threadConnection from "../../../serverconf/db";
import ExploitPatch from "../../lib/exploitPatch";
import ApiLib from "../../lib/apiLib";
import GJPCheck from "../../lib/GJPCheck";
import FixIp from "../../lib/fixIp";
import * as c from "ansi-colors";
import ConsoleApi from "../../../modules/console-api";
import { RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2/promise";

// Интерфейсы для типизации результатов запросов
interface ListRow extends RowDataPacket {
	listID: number;
	listName: string;
	listDesc: string;
	listVersion: number;
	accountID: number;
	userName: string;
	downloads: number;
	starDifficulty: number;
	likes: number;
	starFeatured: number;
	listlevels: string;
	starStars: number;
	countForReward: number;
	uploadDateUnix: number;
	updateDateUnix: number;
	userID: number;
	extID: number;
}

interface CountResult extends RowDataPacket {
	"count(*)": number;
}

interface DownloadCount extends RowDataPacket {
	"count(*)": number;
}

const getLists = async (gdpsid: string, req: any): Promise<string> => {
	function dateNow(): string {
		const currentDate = new Date();
		const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1)
			.toString()
			.padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;
		return fDate;
	}

	try {
		const db = await threadConnection(gdpsid);
		let lvlstring: string = "";
		let userstring: string = "";
		let str: string = "";
		let order: string = "uploadDate";

		let morejoins: string = "";

		const type = req.body.type ? await ExploitPatch.number(req.body.type) : 0;
		const diff = req.body.diff ? await ExploitPatch.numbercolon(req.body.diff) : "-";
		const demonFilter = req.body.demonFilter ? await ExploitPatch.number(req.body.demonFilter) : 0;

		// ADDITIONAL PARAMETERS
		const params: string[] = [];
		if (req.body.star || (req.body.featured && req.body.featured == 1)) {
			params.push("NOT starStars = 0");
		}

		// DIFFICULTY FILTERS
		switch (diff.toString()) {
			case "-1":
				params.push("starDifficulty = '-1'");
				break;
			case "-3":
				params.push("starDifficulty = '0'");
				break;
			case "-2":
				params.push(`starDifficulty = 5+${demonFilter}`);
				break;
			case "-":
				break;
			default:
				if (diff) {
					params.push(`starDifficulty IN (${diff})`);
				}
				break;
		}

		// TYPE DETECTION
		if (req.body.str) {
			str = await ExploitPatch.remove(req.body.str);
		}
		const offset = req.body.page && !isNaN(req.body.page) ? (await ExploitPatch.number(req.body.page)) + "0" : 0;

		params.push("unlisted = 0");

		switch (parseInt(type.toString())) {
			case 0:
				order = "likes";
				if (str) {
					if (!isNaN(Number(str))) {
						params.push(`listID = '${str}'`);
					} else {
						params.push(`listName LIKE '%${str}%'`);
					}
				}
				break;
			case 1:
				order = "downloads";
				break;
			case 2:
				order = "likes";
				break;
			case 3: // TRENDING
				order = "downloads";
				params.push(`lists.uploadDate > ${Date.now() / 1000 - 604800}`);
				break;
			case 4: // RECENT
				order = "uploadDate";
				break;
			case 5:
				params.push(`lists.accountID = '${str}'`);
				break;
			case 6: // TOP LISTS
				params.push("lists.starStars > 0");
				params.push("lists.starFeatured > 0");
				order = "downloads";
				break;
			case 11: // RATED
				params.push("lists.starStars > 0");
				order = "downloads";
				break;
			case 12: //FOLLOWED
				const followed = (await ExploitPatch.numbercolon(req.body.followed)) || 0;
				params.push(`lists.accountID IN (${followed})`);
				break;
			case 13: //FRIENDS
				const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
				const peoplearray = await ApiLib.getFriends(gdpsid, accountID);
				const whereor = peoplearray.join(",");
				params.push(`lists.accountID IN (${whereor})`);
				break;
			case 7: // MAGIC
			case 27: // SENT
				params.push("suggest.suggestLevelId < 0");
				order = "suggest.timestamp";
				morejoins = "LEFT JOIN suggest ON lists.listID*-1 LIKE suggest.suggestLevelId";
				break;
		}

		// ACTUAL QUERY EXECUTION
		let querybase = `FROM lists LEFT JOIN users ON lists.accountID LIKE users.extID ${morejoins}`;
		if (params.length > 0) {
			querybase += ` WHERE (${params.join(") AND (")})`;
		}

		const query = `SELECT lists.*, UNIX_TIMESTAMP(uploadDate) AS uploadDateUnix, UNIX_TIMESTAMP(updateDate) AS updateDateUnix, users.userID, users.userName, users.extID ${querybase}`;
		const finalQuery = order ? `${query} ORDER BY ${order} DESC` : query;
		const limitedQuery = `${finalQuery} LIMIT 10 OFFSET ${offset}`;

		const countQuery = `SELECT count(*) ${querybase}`;

		// Выполняем запросы с типизацией
		const [[results], [[countResult]]] = await Promise.all([db.query<ListRow[]>(limitedQuery), db.query<CountResult[]>(countQuery)]);

		const totallvlcount = countResult["count(*)"];
		const levelcount = results.length;

		for (const list of results) {
			if (!list.uploadDateUnix) list.uploadDateUnix = 0;
			if (!list.updateDateUnix) list.updateDateUnix = 0;
			lvlstring += `1:${list.listID}:2:${list.listName}:3:${list.listDesc}:5:${list.listVersion}:49:${list.accountID}:50:${list.userName}:10:${list.downloads}:7:${list.starDifficulty}:14:${list.likes}:19:${list.starFeatured}:51:${list.listlevels}:55:${list.starStars}:56:${list.countForReward}:28:${list.uploadDateUnix}:29:${list.updateDateUnix}|`;
			userstring += `${await ApiLib.getUserString(list)}|`;
		}

		if (!lvlstring) return "-1";

		if (str && !isNaN(Number(str)) && levelcount == 1) {
			const ip = await FixIp.getIP(req);
			const [[downloadCount]] = await db.query<DownloadCount[]>(
				"SELECT count(*) FROM actions_downloads WHERE levelID = ? AND ip = INET6_ATON(?)",
				[`-${str}`, ip]
			);

			if (downloadCount["count(*)"] < 2) {
				await db.query<ResultSetHeader>("UPDATE lists SET downloads = downloads + 1 WHERE listID = ?", [str]);
				await db.query<ResultSetHeader>("INSERT INTO actions_downloads (levelID, ip) VALUES (?, INET6_ATON(?))", [`-${str}`, ip]);
			}
		}
		lvlstring = lvlstring.slice(0, -1);
		userstring = userstring.slice(0, -1);

		// no comments
		const STOP_SMOKING: string = "Sa1ntSosetHuiHelloFromGreenCatsServerLOL"; // без этого не работает.
		ConsoleApi.Log("main", "Received lists chunks");
		return `${lvlstring}#${userstring}#${totallvlcount}:${offset}:10#${STOP_SMOKING}`;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.getLists`);
		return "-1";
	}
};

export default getLists;
