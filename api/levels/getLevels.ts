"package net.fimastgd.forevercore.api.levels.getLevels";

import { Request } from "express";
import { Connection, RowDataPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ApiLib from "../lib/apiLib";
// import GeneratePass from '../lib/generatePass'; unused import
import GenerateHash from "../lib/generateHash";
import GJPCheck from "../lib/GJPCheck";
import ExploitPatch from "../lib/exploitPatch";
import ConsoleApi from "../../modules/console-api";

/**
 * Interface for level data structure
 */
interface LevelData {
	levelID: number | string;
	stars: number | string;
	coins: number | string;
	[key: string]: any;
}

/**
 * Get list of levels based on filters and search criteria
 * @param gameVersionStr - Game version
 * @param binaryVersionStr - Binary version
 * @param typeStr - Search type (0 = most liked, 1 = most downloaded, etc.)
 * @param diffStr - Difficulty filter
 * @param uncompletedStr - Show only uncompleted levels
 * @param originalStr - Show only original levels
 * @param coinsStr - Show only levels with coins
 * @param completedLvlsStr - Completed levels list
 * @param onlyCompletedStr - Show only completed levels
 * @param songStr - Filter by song
 * @param customSongStr - Filter by custom song
 * @param twoPlayerStr - Filter by two player
 * @param starStr - Filter by star rating
 * @param noStarStr - Filter by no star rating
 * @param gauntletStr - Show gauntlet levels
 * @param lenStr - Filter by level length
 * @param featuredStr - Show featured levels
 * @param epicStr - Show epic levels
 * @param mythicStr - Show mythic levels
 * @param legendaryStr - Show legendary levels
 * @param demonFilterStr - Demon difficulty filter
 * @param strStr - Search string
 * @param pageStr - Page number
 * @param followedStr - Show levels from followed creators
 * @param accountIDStr - Account ID
 * @param gjpStr - GJP hash
 * @param gjp2Str - GJP2 hash
 * @param req - Express request
 * @returns Formatted levels string
 */
const getLevels = async (
	gdpsid: string,
	gameVersionStr?: string,
	binaryVersionStr?: string,
	typeStr?: string,
	diffStr?: string | string[],
	uncompletedStr?: string,
	originalStr?: string,
	coinsStr?: string,
	completedLvlsStr?: string,
	onlyCompletedStr?: string,
	songStr?: string,
	customSongStr?: string,
	twoPlayerStr?: string,
	starStr?: string,
	noStarStr?: string,
	gauntletStr?: string,
	lenStr?: string,
	featuredStr?: string,
	epicStr?: string,
	mythicStr?: string,
	legendaryStr?: string,
	demonFilterStr?: string,
	strStr?: string,
	pageStr?: string,
	followedStr?: string,
	accountIDStr?: string,
	gjpStr?: string,
	gjp2Str?: string,
	req?: Request
): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Initialize variables
		let lvlstring = "";
		let userstring = "";
		let songsstring = "";
		const lvlsmultistring: LevelData[] = [];
		let epicParams: string[] = [];
		let str = "";
		let order = "uploadDate";
		let orderenabled = true;
		let ordergauntlet = false;
		let isIDSearch = false;
		let params: string[] = ["unlisted = 0"];
		let morejoins = "";

		// Process input parameters
		let gameVersion: number, binaryVersion: number, type: number, diff: string | string[];
		let completedLevels: string, song: number, gauntlet: string, epicFilter: string;
		let offset: string, uploadDate: number, followed: string, accountID: string, peoplearray: number[], whereor: string;
		let listLevels: string, totallvlcount: number;
		let sug = "",
			sugg = "";
		let countquery: string;

		// Parse game version
		if (gameVersionStr) {
			gameVersion = parseInt(gameVersionStr);
		} else {
			gameVersion = 0;
		}

		if (isNaN(gameVersion)) {
			return "-1";
		}

		// Handle GD 2.0 binary version quirk
		if (gameVersion == 20 && binaryVersionStr) {
			binaryVersion = parseInt(binaryVersionStr);
			if (binaryVersion > 27) {
				gameVersion++;
			}
		}

		// Parse search type
		if (typeStr) {
			type = parseInt(typeStr);
		} else {
			type = 0;
		}

		// Process difficulty filter
		if (diffStr) {
			// Handle ROBERT LOPATA MOMENT (array input)
			if (Array.isArray(diffStr)) {
				diff = diffStr[0];
			} else {
				diff = diffStr;
			}
		} else {
			diff = "-";
		}

		if (diff === "") {
			diff = "-";
		}

		// Add game version filter
		if (gameVersion === 0) {
			params.push("levels.gameVersion <= 18");
		} else {
			params.push(`levels.gameVersion <= ${gameVersion}`);
		}

		// Add filters based on parameters
		if (originalStr && originalStr === "1") {
			params.push("original = 0");
		}

		if (coinsStr && coinsStr === "1") {
			params.push("starCoins = 1 AND NOT levels.coins = 0");
		}

		if (uncompletedStr && uncompletedStr === "1") {
			completedLevels = await ExploitPatch.numbercolon(completedLvlsStr);
			params.push(`NOT levelID IN (${completedLevels})`);
		}

		if (onlyCompletedStr && onlyCompletedStr === "1") {
			completedLevels = await ExploitPatch.numbercolon(completedLvlsStr);
			params.push(`levelID IN (${completedLevels})`);
		}

		// Song filters
		if (songStr) {
			if (!customSongStr) {
				song = parseInt(await ExploitPatch.number(songStr)) - 1;
				params.push(`audioTrack = ${song} AND songID = 0`);
			} else {
				song = parseInt(await ExploitPatch.number(songStr));
				params.push(`songID = ${song}`);
			}
		}

		// Two player filter
		if (twoPlayerStr === "1") {
			params.push("twoPlayer = 1");
		}

		// Star filters
		if (starStr) {
			params.push("NOT starStars = 0");
		}

		if (noStarStr) {
			params.push("starStars = 0");
		}

		// Gauntlet filter
		if (gauntletStr) {
			gauntlet = await ExploitPatch.remove(gauntletStr);
			const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM gauntlets WHERE ID = ?", [gauntlet]);

			const actualgauntlet = rows[0];
			str = `${actualgauntlet.level1},${actualgauntlet.level2},${actualgauntlet.level3},${actualgauntlet.level4},${actualgauntlet.level5}`;
			params.push(`levelID IN (${str})`);
			type = -1;
		}

		// Length filter
		const len = lenStr ? await ExploitPatch.numbercolon(lenStr) : "-";
		if (len !== "-" && len) {
			params.push(`levelLength IN (${len})`);
		}

		// Rating filters
		if (featuredStr && featuredStr !== "0") epicParams.push("starFeatured = 1");
		if (epicStr && epicStr !== "") epicParams.push("starEpic = 1");
		if (mythicStr && mythicStr !== "") epicParams.push("starEpic = 2");
		if (legendaryStr && legendaryStr !== "") epicParams.push("starEpic = 3");

		epicFilter = epicParams.join(" OR ");
		if (epicFilter && epicFilter !== "") params.push(epicFilter);

		// Difficulty filters
		if (diff !== undefined) {
			const diffValue = typeof diff === "string" ? parseInt(diff) : NaN;

			switch (diffValue) {
				case -1:
					params.push("starDifficulty = '0'");
					break;
				case -3:
					params.push("starAuto = '1'");
					break;
				case -2:
					if (demonFilterStr) {
						const demonFilter = parseInt(demonFilterStr);
						params.push("starDemon = 1");

						switch (demonFilter) {
							case 1:
								params.push("starDemonDiff = '3'");
								break;
							case 2:
								params.push("starDemonDiff = '4'");
								break;
							case 3:
								params.push("starDemonDiff = '0'");
								break;
							case 4:
								params.push("starDemonDiff = '5'");
								break;
							case 5:
								params.push("starDemonDiff = '6'");
								break;
						}
					}
					break;
				default:
					if (diff !== "-") {
						const diffString = typeof diff === "string" ? diff : diff;
						const formattedDiff = diffString.replace(/,/g, "0,") + "0";
						params.push(`starDifficulty IN (${formattedDiff}) AND starAuto = '0' AND starDemon = '0'`);
					}
					break;
			}
		}

		// Search string
		if (strStr) {
			str = await ExploitPatch.remove(strStr);
		}

		// Pagination
		if (pageStr && !isNaN(parseInt(pageStr))) {
			const patch = await ExploitPatch.number(pageStr);
			offset = `${patch}0`;
		} else {
			offset = "0";
		}

		// Filter by search type
		switch (type) {
			case 0:
			case 15:
				order = "likes";
				if (str && str !== "") {
					if (!isNaN(parseInt(str))) {
						params = [`levelID = '${str}'`];
					} else {
						params = [`levelName LIKE '%${str}%'`];
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
				uploadDate = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
				params.push(`uploadDate > ${uploadDate}`);
				order = "likes";
				break;

			case 5:
				params.push(`levels.userID = '${str}'`);
				break;

			case 6: // FEATURED
			case 17: // FEATURED DWE
				if (gameVersion > 21) {
					params.push(`NOT starFeatured = 0 OR NOT starEpic = 0`);
				} else {
					params.push(`NOT starFeatured = 0`);
				}
				order = "rateDate DESC,uploadDate";
				break;

			case 16: // HALL OF FAME
				params.push(`NOT starEpic = 0`);
				order = "rateDate DESC,uploadDate";
				break;

			case 7: // MAGIC
				params.push(`objects > 9999`);
				break;

			case 10: // MAP PACKS
			case 19:
				order = "";
				orderenabled = false;
				params.push(`levelID IN (${str})`);
				break;

			case 11: // AWARDED
				params.push(`NOT starStars = 0`);
				order = "rateDate DESC,uploadDate";
				break;

			case 12: // FOLLOWED
				followed = await ExploitPatch.numbercolon(followedStr);
				params.push(`users.extID IN (${followed})`);
				break;

			case 13: // FRIENDS
				accountID = await GJPCheck.getAccountIDOrDie(gdpsid, accountIDStr, gjp2Str, gjpStr, req);
				peoplearray = await ApiLib.getFriends(gdpsid, accountID);
				whereor = peoplearray.join(",");
				params.push(`users.extID IN (${whereor})`);
				break;

			case 21: // DAILY SAFE
				morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
				params.push(`dailyfeatures.type = 0`);
				order = "dailyfeatures.feaID";
				break;

			case 22: // WEEKLY SAFE
				morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
				params.push(`dailyfeatures.type = 1`);
				order = "dailyfeatures.feaID";
				break;

			case 23: // EVENT SAFE (assumption)
				morejoins = `INNER JOIN dailyfeatures ON levels.levelID = dailyfeatures.levelID`;
				params.push(`dailyfeatures.type = 2`);
				order = "dailyfeatures.feaID";
				break;

			case 25: // LIST LEVELS
				listLevels = await ApiLib.getListLevels(gdpsid, str);
				params = [`levelID IN (${listLevels})`];
				break;

			case 27: // SENT FOR RATE LEVELS
				sug = ", suggest.suggestLevelId, suggest.timestamp";
				sugg = "LEFT JOIN suggest ON levels.levelID = suggest.suggestLevelId";
				params.push("suggestLevelId > 0");
				order = "suggest.timestamp";
				break;
		}

		// Build query
		const querybase = `
            FROM levels
            LEFT JOIN songs ON levels.songID = songs.ID
            LEFT JOIN users ON levels.userID = users.userID
            ${sugg} ${morejoins}
        `;

		// Add WHERE clause
		const whereClause = params.length > 0 ? ` WHERE (${params.join(") AND (")})` : "";

		// Full query with joins and filters
		const query = `
            SELECT levels.*, songs.ID, songs.name, songs.authorID, songs.authorName,
            songs.size, songs.isDisabled, songs.download, users.userName, users.extID
            ${sug} ${querybase} ${whereClause}
        `;

		// Add ordering
		const orderClause = orderenabled && order ? ` ORDER BY ${order} ${ordergauntlet ? "ASC" : "DESC"}` : "";

		// Final query with limit and offset
		const finalQuery = `${query}${orderClause} LIMIT 10 OFFSET ${offset}`;

		// Count query for total levels
		countquery = `SELECT count(*) as total ${querybase}${whereClause}`;

		// Execute queries
		const [countResult] = await db.query<RowDataPacket[]>(countquery);
		totallvlcount = countResult[0].total;

		const [result] = await db.execute<RowDataPacket[]>(finalQuery);
		const levelcount = result.length;

		// Process results
		for (const level1 of result) {
			if (level1.levelID) {
				// Handle unlisted levels
				if (isIDSearch && level1.unlisted > 1) {
					if (!accountID) {
						accountID = await GJPCheck.getAccountIDOrDie(gdpsid, accountIDStr, gjp2Str, gjpStr, req);
					}

					if (!(await ApiLib.isFriends(gdpsid, accountID, level1.extID)) && accountID != level1.extID) {
						break;
					}
				}

				// Add level data for hash
				lvlsmultistring.push({
					levelID: level1.levelID,
					stars: level1.starStars,
					coins: level1.starCoins
				});

				// Add gauntlet info if needed
				if (gauntlet) {
					lvlstring += `44:${gauntlet}:`;
				}

				// Build level string
				lvlstring +=
					`1:${level1.levelID}:2:${level1.levelName}:5:${level1.levelVersion}:6:${level1.userID}:8:10:` +
					`9:${level1.starDifficulty}:10:${level1.downloads}:12:${level1.audioTrack}:13:${level1.gameVersion}:` +
					`14:${level1.likes}:17:${level1.starDemon}:43:${level1.starDemonDiff}:25:${level1.starAuto}:` +
					`18:${level1.starStars}:19:${level1.starFeatured}:42:${level1.starEpic}:45:${level1.objects}:` +
					`3:${level1.levelDesc}:15:${level1.levelLength}:30:${level1.original}:31:${level1.twoPlayer}:` +
					`37:${level1.coins}:38:${level1.starCoins}:39:${level1.requestedStars}:46:1:47:2:` +
					`40:${level1.isLDM}:35:${level1.songID}|`;

				// Add song info if custom song
				if (level1.songID !== 0) {
					const song = await ApiLib.getSongString(level1);
					if (song) {
						songsstring += `${song}~:~`;
					}
				}

				// Add user info
				userstring += `${await ApiLib.getUserString(level1)}|`;
			}
		}

		// Remove trailing separators
		lvlstring = lvlstring.slice(0, -1);
		userstring = userstring.slice(0, -1);
		songsstring = songsstring.slice(0, -3);

		// Build final result
		let resultFN = `${lvlstring}#${userstring}`;

		// Add songs for newer game versions
		if (gameVersion > 18) {
			resultFN += `#${songsstring}`;
		}

		// Add pagination info and hash
		resultFN += `#${totallvlcount}:${offset}:10#`;
		resultFN += await GenerateHash.genMulti(lvlsmultistring);

		ConsoleApi.Log("main", `Received levels by accountID: ${accountIDStr || "unknown"}`);
		return resultFN;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.getLevels`);
		return "-1";
	}
};

export default getLevels;
