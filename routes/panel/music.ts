import express, { Router, Request, Response } from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import Panel from "../../panel/main";
import { captcha } from "../../serverconf/captcha";
import getSongInfo from "../../panel/music/newgrounds";
import getZeMuInfo from "../../panel/music/zemu";
import getSongLinkInfo from "../../panel/music/link";
import getSongDropboxInfo from "../../panel/music/dropbox";
import processYoutubeUpload from "../../panel/music/youtube";
import getSongList from "../../panel/music/list";
import { getMusicState } from "../../serverconf/music";
import ConsoleApi from "../../modules/console-api";

const router: Router = express.Router({ mergeParams: true });
router.use(cookieParser());

interface AuthRequest extends Request {
	params: {
		gdpsid: string;
		offset?: string;
	};
	cookies: {
		[key: string]: string;
	};
	body: {
		songid?: string;
		songname?: string;
		songurl?: string;
		captchaResponse?: string;
	};
}

// проверка авторизации
function checkAuth(gdpsid: string, username: string): boolean {
	return !!username;
}

// проверка капчи
async function verifyCaptcha(hCaptchaResponse: string): Promise<boolean> {
	const hCaptchaSecret = captcha.secret;
	const data = new URLSearchParams({
		secret: hCaptchaSecret,
		response: hCaptchaResponse
	});

	try {
		const response = await axios.post("https://hcaptcha.com/siteverify", data);
		return response.data.success === true || hCaptchaResponse === "1";
	} catch {
		return hCaptchaResponse === "1";
	}
}

// проверка размера файла
async function checkFile(url: string): Promise<string> {
	try {
		const response = await fetch(url, { method: "HEAD" });
		if (response.ok) {
			const sizeInBytes = response.headers.get("content-length");
			return sizeInBytes ? `${(parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2)}` : "0.01";
		}
		return "Undefined";
	} catch {
		return "Undefined";
	}
}

// форматирование ответа
function parseMusicResponse(result: string) {
	const [message, idStr] = result.split(":");
	const id = parseInt(idStr) || 0;
	const isSuccess = message.toLowerCase().includes("success");

	const codeMap: Record<string, number> = {
		Success: 1,
		DublicateSongException: -2,
		CapchaIsNotCompleted: -3,
		UnknownSongException: -4,
		ZeMuIsNotAvailable: -5
	};

	return {
		status: isSuccess ? "success" : "error",
		code: codeMap[message] || (isSuccess ? 1 : -1),
		server_status: 200,
		message,
		...(id > 0 ? { songID: id } : {})
	};
}

// получение списка музыки
router.get("/list", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/music/list by ${username}`);
		const table = await getSongList(gdpsid, 0);
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Music list retrieved",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Music List", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve music list"
		});
	}
});

// получение списка музыки с пагинацией
router.get("/list/:offset", async (req: AuthRequest, res: Response) => {
	const { gdpsid, offset: offsetParam } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/music/list/${offsetParam} by ${username}`);
		const offset = offsetParam.split(".")[0] === "offset" ? parseInt(offsetParam.split(".")[1], 10) : 0;
		const table = await getSongList(gdpsid, offset);
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Paginated music list retrieved",
			data: table,
			page: offset
		});
	} catch (error) {
		ConsoleApi.Error("Music List", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve paginated music list"
		});
	}
});

// добавление музыки из Newgrounds
router.post("/newgrounds", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/music/newgrounds by ${username}`);
		if (!req.body.songid) throw new Error("Song ID is required");
		const result = await getSongInfo(gdpsid, req.body.songid);
		res.status(200).json(parseMusicResponse(result));
	} catch (error) {
		ConsoleApi.Error("Newgrounds Music", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to process Newgrounds music"
		});
	}
});

// добавление музыки из ZeMu
router.post("/zemu", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/music/zemu by ${username}`);
		if (!(await getMusicState(gdpsid)).zemu) {
			res.status(403).json({
				status: "error",
				code: -5,
				server_status: 403,
				message: "ZeMuIsNotAvailable"
			});
		}

		if (!req.body.songid) throw new Error("Song ID is required");
		const result = await getZeMuInfo(gdpsid, req.body.songid);
		res.status(200).json(parseMusicResponse(result));
	} catch (error) {
		ConsoleApi.Error("ZeMu Music", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to process ZeMu music"
		});
	}
});

// добавление музыки по ссылке
router.post("/link", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/music/link by ${username}`);

		if (!req.body.captchaResponse || !(await verifyCaptcha(req.body.captchaResponse))) {
			res.status(200).json({
				status: "error",
				code: -3,
				server_status: 200,
				message: "CapchaIsNotCompleted"
			});
		}

		if (!req.body.songname || !req.body.songurl) {
			throw new Error("Song name and URL are required");
		}

		const fileSize = await checkFile(req.body.songurl);
		const SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";

		const songData: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];

		const result = await getSongLinkInfo(gdpsid, songData);
		res.status(200).json(parseMusicResponse(result));
	} catch (error) {
		ConsoleApi.Error("Link Music", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to process music link"
		});
	}
});

// добавление музыки из Dropbox
router.post("/dropbox", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/music/dropbox by ${username}`);

		if (!req.body.captchaResponse || !(await verifyCaptcha(req.body.captchaResponse))) {
			res.status(200).json({
				status: "error",
				code: -3,
				server_status: 200,
				message: "CapchaIsNotCompleted"
			});
		}

		if (!req.body.songname || !req.body.songurl) {
			throw new Error("Song name and URL are required");
		}

		const fileSize = await checkFile(req.body.songurl);
		const SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";

		const songData: [string, string, string | number] = [req.body.songname, req.body.songurl, SIZE];

		const result = await getSongDropboxInfo(gdpsid, songData);
		res.status(200).json(parseMusicResponse(result));
	} catch (error) {
		ConsoleApi.Error("Dropbox Music", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to process Dropbox music"
		});
	}
});

// добавление музыки из YouTube
router.post("/youtube", async (req: AuthRequest, res: Response) => {
	const { gdpsid } = req.params;
	const username = req.cookies[`${gdpsid}-username`];

	if (!checkAuth(gdpsid, username)) {
		res.status(401).json({
			status: "error",
			code: -1,
			server_status: 401,
			message: "Unauthorized"
		});
	}

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/music/youtube by ${username}`);

		if (!req.body.captchaResponse || !(await verifyCaptcha(req.body.captchaResponse))) {
			res.status(200).json({
				status: "error",
				code: -3,
				server_status: 200,
				message: "CapchaIsNotCompleted"
			});
		}

		if (!req.body.songname || !req.body.songurl) {
			throw new Error("Song name and URL are required");
		}

		const result = await processYoutubeUpload(
			gdpsid,
			{
				songname: req.body.songname,
				songurl: req.body.songurl,
				originalLink: req.body.songurl
			},
			req.protocol,
			req.get("host") || ""
		);

		res.status(200).json(parseMusicResponse(result));
	} catch (error) {
		ConsoleApi.Error("YouTube Music", `Error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to process YouTube music"
		});
	}
});

export default router;