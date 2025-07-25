"package net.fimastgd.forevercore.routes.panel.music";

import express from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import { getSettings } from "../../serverconf/settings";
import Panel from "../../panel/main";
import { captcha } from "../../serverconf/captcha";
import getSongInfo from "../../panel/music/newgrounds";
import getZeMuInfo from "../../panel/music/zemu";
import getSongLinkInfo from "../../panel/music/link";
import getSongDropboxInfo from "../../panel/music/dropbox";
import getSongYoutubeInfo from "../../panel/music/youtube";
import getSongList from "../../panel/music/list";
import { getMusicState } from "../../serverconf/music";
import ytdl from "ytdl-core";
import fs from "fs";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { exec } from "youtube-dl-exec";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import ConsoleApi from "../../modules/console-api";
import threadConnection from "../../serverconf/db";

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRandomString(): Promise<string> {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomLetters = `${letters[getRandomInt(0, 25)]}${letters[getRandomInt(0, 25)]}`;
	const randomNumbers = `${getRandomInt(111111, 999999).toString().padStart(6, "0")}`;
	return `${randomLetters}_${randomNumbers}`;
}

/*(async () => {
    const randomString = await generateRandomString();
    console.log(randomString); 
})();*/

const router = express.Router({ mergeParams: true });

router.use(cookieParser());

router.get("/", async (req: express.Request, res: express.Response) => {
	res.render("errors/404");
});

router.get("/list", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	if (!req.cookies[gdpsid + "-username"]) {
		if (gdpsid != "") {
			res.redirect(`/${gdpsid}/panel/accounts/login`);
		} else {
			res.redirect(`/panel/accounts/login`);
		}
		return;
	}
	ConsoleApi.Log("Query thread", `Handled new session '/panel/music/list', opened by ${req.cookies[gdpsid + "-username"]}`);
	let offset: number;
	// console.log(req.query.offset)
	offset = 0;
	const page: number = 0;
	const table = await getSongList(gdpsid, offset);
	const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, rows: table, page: page };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/music/list'`);
	res.render("panel/music/list", data);
	return;
});
router.get("/list/:offset", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	if (!req.cookies[gdpsid + "-username"]) {
		if (gdpsid != "") {
			res.redirect(`/${gdpsid}/panel/accounts/login`);
		} else {
			res.redirect(`/panel/accounts/login`);
		}
		return;
	}
	let offset: number;

	const offsetParam = req.params.offset;
	const offsetSplit = offsetParam ? offsetParam.split(".") : [];

	if (offsetSplit[0] === "offset") {
		offset = parseInt(offsetSplit[1], 10);
	} else {
		offset = 0;
	}

	// console.log(offset);

	const table = await getSongList(gdpsid, offset);
	const page: number = parseInt(offsetSplit[1], 10);
	const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, rows: table, page: page };
	res.render("panel/music/list", data);
	return;
});

router.get("/:route", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const ROUTE = req.params.route;
	if (ROUTE === "newgrounds") {
		if (!req.cookies[gdpsid + "-username"]) {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log("Query thread", `Handled new session '/panel/music/newgrounds', opened by ${req.cookies[gdpsid + "-username"]}`);
		const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid };
		ConsoleApi.Log("Render thread", `Rendered page '/panel/music/newgrounds'`);
		res.render("panel/music/newgrounds", data);
	} else if (ROUTE === "zemu") {
		if (!req.cookies[gdpsid + "-username"]) {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log("Query thread", `Handled new session '/panel/music/zemu', opened by ${req.cookies[gdpsid + "-username"]}`);
		if (getMusicState(gdpsid).zemu) {
			const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid };
			ConsoleApi.Log("Render thread", `Rendered page '/panel/music/zemu'`);
			res.render("panel/music/zemu", data);
		} else {
			res.send("ZeMu is not available for your GDPS");
		}
	} else if (ROUTE === "link") {
		if (!req.cookies[gdpsid + "-username"]) {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log("Query thread", `Handled new session '/panel/music/link', opened by ${req.cookies[gdpsid + "-username"]}`);
		const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, captchaKey: captcha.key };
		ConsoleApi.Log("Render thread", `Rendered page '/panel/music/link'`);
		res.render("panel/music/link", data);
	} else if (ROUTE === "dropbox") {
		if (!req.cookies[gdpsid + "-username"]) {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log("Query thread", `Handled new session '/panel/music/dropbox', opened by ${req.cookies[gdpsid + "-username"]}`);
		const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, captchaKey: captcha.key };
		ConsoleApi.Log("Render thread", `Rendered page '/panel/music/dropbox'`);
		res.render("panel/music/dropbox", data);
		return;
	} else if (ROUTE === "youtube") {
		if (!req.cookies[gdpsid + "-username"]) {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
		ConsoleApi.Log("Query thread", `Handled new session '/panel/music/youtube', opened by ${req.cookies[gdpsid + "-username"]}`);
		const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, captchaKey: captcha.key };
		ConsoleApi.Log("Render thread", `Rendered page '/panel/music/youtube'`);
		res.render("panel/music/youtube", data);
		return;
	} else {
		res.render("errors/404");
		return;
	}
});

// POST
router.post("/newgrounds", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const result = await getSongInfo(gdpsid, req.body.songid);
	res.status(200).send(result);
});

router.post("/zemu", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	if (getMusicState(gdpsid).zemu) {
		const result = await getZeMuInfo(gdpsid, req.body.songid);
		res.status(200).send(result);
	} else {
		res.status(500).send("ZeMu is not available for your GDPS");
	}
});

router.post("/link", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const hCaptchaSecret = captcha.secret;
	const hCaptchaResponse = req.body.captchaResponse;

	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});

	const response = await axios.post("https://hcaptcha.com/siteverify", data);
	const responseData = response.data;
	const resp = responseData.success;
	let captchaResult: string;
	if (resp === true) {
		captchaResult = "1";
	} else {
		captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
	}
	if (captchaResult === "-1") {
		res.status(200).send("CapchaIsNotCompleted:0");
		return;
	}

	async function checkFile(url: string): Promise<string> {
		try {
			const response = await fetch(url, { method: "HEAD" });
			if (response.ok) {
				const sizeInBytes = response.headers.get("content-length");
				if (sizeInBytes) {
					const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
					return `${sizeInMB}`;
				}
			}
			return "Undefined";
		} catch (error) {
			return "Undefined";
		}
	}

	let SIZE: string | number;
	const fileSize = await checkFile(req.body.songurl);
	SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";

	const array: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];
	const result = await getSongLinkInfo(gdpsid, array);
	res.status(200).send(result);
});

// DROPBOX
router.post("/dropbox", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const hCaptchaSecret = captcha.secret;
	const hCaptchaResponse = req.body.captchaResponse;

	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});

	const response = await axios.post("https://hcaptcha.com/siteverify", data);
	const responseData = response.data;
	const resp = responseData.success;
	let captchaResult: string;
	if (resp === true) {
		captchaResult = "1";
	} else {
		captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
	}
	if (captchaResult === "-1") {
		res.status(200).send("CapchaIsNotCompleted:0");
		return;
	}
	async function checkFile(url: string): Promise<string> {
		try {
			const response = await fetch(url, { method: "HEAD" });
			if (response.ok) {
				const sizeInBytes = response.headers.get("content-length");
				if (sizeInBytes) {
					const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
					return `${sizeInMB}`;
				} else {
					return "0.01";
				}
			}
			return "Undefined";
		} catch (error) {
			return "Undefined";
		}
	}
	let SIZE: string | number;
	const fileSize = await checkFile(req.body.songurl);
	SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
	const array: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];
	const result = await getSongDropboxInfo(gdpsid, array);
	res.status(200).send(result);
});

// YOUTUBE
// TODO: рефакторинг кода
router.post("/youtube", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const db = await threadConnection(gdpsid);
	const hCaptchaSecret = captcha.secret;
	const hCaptchaResponse = req.body.captchaResponse;
	const originalLink: string = req.body.songurl;
	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});
	const response = await axios.post("https://hcaptcha.com/siteverify", data);
	const responseData = response.data;
	const resp = responseData.success;
	let captchaResult: string;
	if (resp === true) {
		captchaResult = "1";
	} else {
		captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
	}
	if (captchaResult === "-1") {
		res.status(200).send("CapchaIsNotCompleted:0");
		return;
	}

	async function checkFile(url: string): Promise<string> {
		try {
			const response = await fetch(url, { method: "HEAD" });
			if (response.ok) {
				const sizeInBytes = response.headers.get("content-length");
				if (sizeInBytes) {
					const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
					return `${sizeInMB}`;
				}
			}
			return "Undefined";
		} catch (error) {
			return "Undefined";
		}
	}

	const rstr: string = await generateRandomString();
	const songurl: string = `${req.protocol}://${req.get("host")}/${gdpsid}` + `/music/${rstr}.mp3`;
	let isTimeOverload: number = 0;
	let isUnknownSong: number = 0;
	let isSongDublicate: boolean = false;

	async function checkSong(): Promise<number> {
		const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM songs WHERE originalLink = ?", [originalLink]);
		if (rows.length > 0) {
			isSongDublicate = true;
			return rows[0].ID;
		} else {
			return 0;
		}
	}
	await checkSong();
	async function download(videoUrl: string, GDPSID: string): Promise<void> {
		const outputPath = path.join(__dirname, "..", "..", "public", gdpsid, "music", `${rstr}.mp3`);
		const cookiesPath = path.join(__dirname, "..", "..", "serverconf", "youtube_cookies.txt");
		try {
			await new Promise<void>((resolve, reject) => {
				exec(videoUrl, {
					output: outputPath,
					extractAudio: true,
					audioFormat: "mp3",
					ffmpegLocation: "/usr/bin/ffmpeg",
					cookies: cookiesPath
				})
					.then(output => {
						//console.log('Download finished:', outputPath);
						ConsoleApi.Log("main", `Panel action: downloaded from youtube: ${outputPath}`);
						resolve();
					})
					.catch(error => {
						ConsoleApi.Error(
							"main",
							`Panel action: failed to download from youtube: ${error} at net.fimastgd.forevercore.routes.panel.music`
						);
						reject(error);
					});
			});
		} catch (error) {
			ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.routes.panel.music`);
			isUnknownSong = 1;
		}
	}
	if (!isSongDublicate) {
		await download(req.body.songurl, gdpsid);
	}

	let SIZE: string;
	const fileSize = await checkFile(songurl);
	SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
	let result: string;
	if (isTimeOverload == 0 && isUnknownSong == 0 && isSongDublicate == false) {
		// console.log("Writing to DB...");
		const array: [string, string, string | number, string] = [req.body.songname, songurl, SIZE, originalLink];
		// [4]
		// checkMemory();
		result = await getSongYoutubeInfo(gdpsid, array);
		// [5]
		// checkMemory();
	} else if (isUnknownSong == 1) {
		result = "UnknownSongException:0";
	} else if (isSongDublicate) {
		result = `DublicateSongException:${await checkSong()}`;
	} else {
		result = "SizeOverload:0";
	}
	// console.log("RESULT:", result);

	await res.status(200).send(result);
	return;
});

export default router;
