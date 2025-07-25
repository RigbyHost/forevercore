import express from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import { getSettings } from "@/serverconf/settings";
import Panel from "@/panel/main";
import { captcha } from "@/serverconf/captcha";
import getSongInfo from "@/panel/music/newgrounds";
import getZeMuInfo from "@/panel/music/zemu";
import getSongLinkInfo from "@/panel/music/link";
import getSongDropboxInfo from "@/panel/music/dropbox";
import processYoutubeUpload from "@/panel/music/youtube";
import getSongList from "@/panel/music/list";
import { getMusicState } from "@/serverconf/music";
import ConsoleApi from "@/modules/console-api";

const router = express.Router({ mergeParams: true });

router.use(cookieParser());

// Общая функция проверки авторизации
function checkAuth(req: express.Request, res: express.Response, gdpsid: string): boolean {
	if (!req.cookies[gdpsid + "-username"]) {
		if (gdpsid != "") {
			res.redirect(`/${gdpsid}/panel/accounts/login`);
		} else {
			res.redirect(`/panel/accounts/login`);
		}
		return false;
	}
	return true;
}

// Общая функция проверки размера файла
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

/* router.get("/", async (req: express.Request, res: express.Response) => {
	res.render("errors/404");
}); */

/* GET ROUTES - DEPRECATED, NEED TO MIGRATE TO NEXT */
// GET routes для списка музыки
router.get("/list", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	if (!checkAuth(req, res, gdpsid)) return;

	ConsoleApi.Log("Query thread", `Handled new session '/panel/music/list', opened by ${req.cookies[gdpsid + "-username"]}`);
	const offset: number = 0;
	const page: number = 0;
	const table = await getSongList(gdpsid, offset);
	const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, rows: table, page: page };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/music/list'`);
	res.render("panel/music/list", data);
});

router.get("/list/:offset", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	if (!checkAuth(req, res, gdpsid)) return;

	const offsetParam = req.params.offset;
	const offsetSplit = offsetParam ? offsetParam.split(".") : [];
	const offset = offsetSplit[0] === "offset" ? parseInt(offsetSplit[1], 10) : 0;

	const table = await getSongList(gdpsid, offset);
	const page: number = parseInt(offsetSplit[1], 10);
	const data = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid, rows: table, page: page };
	res.render("panel/music/list", data);
});

// GET routes для различных источников музыки
router.get("/:route", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const ROUTE = req.params.route;

	if (!checkAuth(req, res, gdpsid)) return;

	const baseData = { GDPS: getSettings(gdpsid).serverName, GDPSID: gdpsid };

	switch (ROUTE) {
		case "newgrounds":
			ConsoleApi.Log("Query thread", `Handled new session '/panel/music/newgrounds', opened by ${req.cookies[gdpsid + "-username"]}`);
			ConsoleApi.Log("Render thread", `Rendered page '/panel/music/newgrounds'`);
			res.render("panel/music/newgrounds", baseData);
			break;

		case "zemu":
			ConsoleApi.Log("Query thread", `Handled new session '/panel/music/zemu', opened by ${req.cookies[gdpsid + "-username"]}`);
			if (getMusicState(gdpsid).zemu) {
				ConsoleApi.Log("Render thread", `Rendered page '/panel/music/zemu'`);
				res.render("panel/music/zemu", baseData);
			} else {
				res.send("ZeMu is not available for your GDPS");
			}
			break;

		case "link":
			ConsoleApi.Log("Query thread", `Handled new session '/panel/music/link', opened by ${req.cookies[gdpsid + "-username"]}`);
			ConsoleApi.Log("Render thread", `Rendered page '/panel/music/link'`);
			res.render("panel/music/link", { ...baseData, captchaKey: captcha.key });
			break;

		case "dropbox":
			ConsoleApi.Log("Query thread", `Handled new session '/panel/music/dropbox', opened by ${req.cookies[gdpsid + "-username"]}`);
			ConsoleApi.Log("Render thread", `Rendered page '/panel/music/dropbox'`);
			res.render("panel/music/dropbox", { ...baseData, captchaKey: captcha.key });
			break;

		case "youtube":
			ConsoleApi.Log("Query thread", `Handled new session '/panel/music/youtube', opened by ${req.cookies[gdpsid + "-username"]}`);
			ConsoleApi.Log("Render thread", `Rendered page '/panel/music/youtube'`);
			res.render("panel/music/youtube", { ...baseData, captchaKey: captcha.key });
			break;

		default:
			res.render("errors/404");
			break;
	}
});

// POST routes
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
	// проверка размера файла
	const fileSize = await checkFile(req.body.songurl);
	const SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
	const array: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];
	const result = await getSongLinkInfo(gdpsid, array);
	res.status(200).send(result);
});

router.post("/dropbox", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	
	// Проверка captcha
	const captchaValid = await verifyCaptcha(req.body.captchaResponse);
	if (!captchaValid) {
		res.status(200).send("CapchaIsNotCompleted:0");
		return;
	}

	// Проверка размера файла
	const fileSize = await checkFile(req.body.songurl);
	const SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";

	const array: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];
	const result = await getSongDropboxInfo(gdpsid, array);
	res.status(200).send(result);
});

// YouTube POST route - упрощенный благодаря рефакторингу
router.post("/youtube", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	// подготовка данных для обработки
	const requestData = {
		songname: req.body.songname,
		songurl: req.body.songurl,
		originalLink: req.body.songurl
	};
	// обработка загрузки через отдельный модуль
	const result = await processYoutubeUpload(
		gdpsid, 
		requestData, 
		req.protocol, 
		req.get("host") || ""
	);

	res.status(200).send(result);
});

export default router;