"package net.fimastgd.forevercore.api.levels.downloadLevel";

import { promises as fs, existsSync } from "fs";
import path from "path";
import zlib from "zlib";
import { Request } from "express";
import { Connection, RowDataPacket } from "mysql2/promise";
import ApiLib from "../lib/apiLib";
import ExploitPatch from "../lib/exploitPatch";
import GJPCheck from "../lib/GJPCheck";
import GenerateHash from "../lib/generateHash";
import XORCipher from "../lib/XORCipher";
import FixIp from "../lib/fixIp";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";
import __root from "net.fimastgd.forevercore:root";

interface LevelData {
	levelID: string;
	levelName: string;
	levelDesc: string;
	levelString: string;
	levelVersion: string;
	userID: string;
	starDifficulty: string;
	downloads: string;
	audioTrack: string;
	gameVersion: string;
	likes: string;
	starDemon: string;
	starDemonDiff: string;
	starAuto: string;
	starStars: string;
	starFeatured: string;
	starEpic: string;
	objects: string;
	levelLength: string;
	original: string;
	twoPlayer: string;
	songID: string;
	extraString: string;
	coins: string;
	starCoins: string;
	requestedStars: string;
	wt: string;
	wt2: string;
	settingsString: string;
	isLDM: string;
	password: string;
	uploadDate: number;
	updateDate: number;
	extID?: string;
	userName?: string;
	ts: string;
	songIDs?: string;
	sfxIDs?: string;
	unlisted2: number; // Добавлено недостающее свойство
	levelInfo: string; // Добавлено недостающее свойство
}

/**
 * Handles downloading a level
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param gameVersionStr - Game version
 * @param levelIDStr - Level ID
 * @param extrasStr - Extras flag
 * @param incStr - Increment downloads flag
 * @param binaryVersionStr - Binary version
 * @param req - Express request
 * @returns Download response string
 */
const downloadLevel = async (
	gdpsid: string,
	accountIDStr?: string,
	gjp2Str?: string,
	gjpStr?: string,
	gameVersionStr?: string,
	levelIDStr?: string,
	extrasStr?: string,
	incStr?: string,
	binaryVersionStr?: string,
	req?: Request
): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Parse and validate input parameters
		const gameVersion = gameVersionStr ? parseInt(await ExploitPatch.remove(gameVersionStr)) : 1;

		if (!levelIDStr) {
			return "-1";
		}

		const extras = extrasStr === "1";
		const inc = incStr === "1";
		const ip = req ? await FixIp.getIP(req) : "";

		let levelID = await ExploitPatch.remove(levelIDStr);
		const binaryVersion = binaryVersionStr ? parseInt(await ExploitPatch.remove(binaryVersionStr)) : 0;

		if (isNaN(parseInt(levelID))) {
			return "-1";
		}

		// Handle special level IDs
		let daily = 0;
		let feaID = 0;

		switch (levelID) {
			case "-1": // Daily level
				const [result25] = await db.execute<RowDataPacket[]>(
					"SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 0 ORDER BY timestamp DESC LIMIT 1",
					[Math.floor(Date.now() / 1000)]
				);

				if (result25.length === 0) return "-1";

				levelID = result25[0].levelID.toString();
				feaID = result25[0].feaID;
				daily = 1;
				break;

			case "-2": // Weekly level
				const [result26] = await db.execute<RowDataPacket[]>(
					"SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 1 ORDER BY timestamp DESC LIMIT 1",
					[Math.floor(Date.now() / 1000)]
				);

				if (result26.length === 0) return "-1";

				levelID = result26[0].levelID.toString();
				feaID = result26[0].feaID + 100001;
				daily = 1;
				break;

			case "-3" /*  Event level (now not tested)
                       TODO: Test                     */:
				const [result27] = await db.execute<RowDataPacket[]>(
					"SELECT feaID, levelID FROM dailyfeatures WHERE timestamp < ? AND type = 2 ORDER BY timestamp DESC LIMIT 1",
					[Math.floor(Date.now() / 1000)]
				);

				if (result27.length === 0) return "-1";

				levelID = result27[0].levelID.toString();
				feaID = result27[0].feaID;
				daily = 1;
				break;
		}

		// Get level data
		const query =
			daily === 1
				? "SELECT levels.*, users.userName, users.extID FROM levels LEFT JOIN users ON levels.userID = users.userID WHERE levelID = ?"
				: "SELECT * FROM levels WHERE levelID = ?";

		const [rows] = await db.execute<RowDataPacket[]>(query, [levelID]);

		if (rows.length === 0) {
			return "-1";
		}

		const level = rows[0] as LevelData;

		// Check if user has access to the level
		if (level.unlisted2 !== 0) {
			const accountID = await GJPCheck.getAccountIDOrDie(gdpsid, accountIDStr, gjp2Str, gjpStr, req);

			if (!(level.extID === accountID || (await ApiLib.isFriends(gdpsid, accountID, level.extID)))) {
				return "-1";
			}
		}

		// Increment download count if requested
		if (inc) {
			const [downloadCount] = await db.execute<RowDataPacket[]>(
				"SELECT count(*) as count FROM actions_downloads WHERE levelID = ? AND ip = INET6_ATON(?)",
				[levelID, ip]
			);

			if (downloadCount[0].count < 2) {
				await db.execute("UPDATE levels SET downloads = downloads + 1 WHERE levelID = ?", [levelID]);

				await db.execute("INSERT INTO actions_downloads (levelID, ip) VALUES (?, INET6_ATON(?))", [levelID, ip]);
			}
		}

		// Format dates
		const uploadDateObj = new Date(level.uploadDate * 1000);
		const updateDateObj = new Date(level.updateDate * 1000);

		const dateOptions: Intl.DateTimeFormatOptions = {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit"
		};

		let uploadDate = uploadDateObj.toLocaleString("ru-RU", dateOptions).replace(/:/g, "-").replace(/,/g, "").replace(/\./g, "-");

		let updateDate = updateDateObj.toLocaleString("ru-RU", dateOptions).replace(/:/g, "-").replace(/,/g, "").replace(/\./g, "-");

		// Process password
		let pass = level.password;
		let desc = level.levelDesc;

		if ((await ApiLib.checkModIPPermission(gdpsid, "actionFreeCopy")) === true) {
			pass = "1";
		}

		// XOR password for newer game versions
		let xorPass = pass;
		if (gameVersion > 19) {
			if (pass !== "0") {
				xorPass = Buffer.from(await XORCipher.cipher(pass, 26364)).toString("base64");
			}
		} else {
			desc = await ExploitPatch.remove(Buffer.from(desc, "base64").toString());
		}

		// Get level string from file or database
		let levelString: string;
		const levelPath = path.join(__root, "GDPS_DATA", gdpsid, "data", "levels", `level_${levelID}.dat`);

		if (existsSync(levelPath)) {
			levelString = await fs.readFile(levelPath, "utf8");
		} else {
			levelString = level.levelString;
		}

		// Compress level string for newer game versions
		if (gameVersion > 18) {
			if (levelString.substring(0, 3) === "kS1") {
				levelString = Buffer.from(zlib.gzipSync(levelString)).toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
			}
		}

		// Build response
		let response = [
			`1:${level.levelID}`,
			`2:${level.levelName}`,
			`3:${desc}`,
			`4:${levelString}`,
			`5:${level.levelVersion}`,
			`6:${level.userID}`,
			`8:10`,
			`9:${level.starDifficulty}`,
			`10:${level.downloads}`,
			`11:1`,
			`12:${level.audioTrack}`,
			`13:${level.gameVersion}`,
			`14:${level.likes}`,
			`17:${level.starDemon}`,
			`43:${level.starDemonDiff}`,
			`25:${level.starAuto}`,
			`18:${level.starStars}`,
			`19:${level.starFeatured}`,
			`42:${level.starEpic}`,
			`45:${level.objects}`,
			`15:${level.levelLength}`,
			`30:${level.original}`,
			`31:${level.twoPlayer}`,
			`28:${uploadDate}`,
			`29:${updateDate}`,
			`35:${level.songID}`,
			`36:${level.extraString}`,
			`37:${level.coins}`,
			`38:${level.starCoins}`,
			`39:${level.requestedStars}`,
			`46:${level.wt}`,
			`47:${level.wt2}`,
			`48:${level.settingsString}`,
			`40:${level.isLDM}`,
			`27:${xorPass}`,
			`52:${level.songIDs || ""}`,
			`53:${level.sfxIDs || ""}`,
			`57:${level.ts}`
		].join(":");

		// Add feature ID for daily levels
		if (daily === 1) {
			response += `:41:${feaID}`;
		}

		// Add extra info if requested
		if (extras) {
			response += `:26:${level.levelInfo}`;
		}

		// Add hashes and additional data
		const levelStringHash = await GenerateHash.genSolo(levelString);
		response += `#${levelStringHash}#`;

		const hashData = `${level.userID},${level.starStars},${level.starDemon},${level.levelID},${level.starCoins},${level.starFeatured},${pass},${feaID}`;
		const secondHash = await GenerateHash.genSolo2(hashData);
		response += secondHash;

		// Add user data for daily levels or binary version 30
		if (daily === 1) {
			response += `#${await ApiLib.getUserString(level)}`;
		} else if (binaryVersion === 30) {
			response += `#${hashData}`;
		}

		ConsoleApi.Log("main", `Downloaded level ${levelID}.dat`);
		return response;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.levels.downloadLevel`);
		return "-1";
	}
};

export default downloadLevel;
