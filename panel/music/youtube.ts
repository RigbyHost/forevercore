import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import threadConnection from "@/serverconf/db";
import ConsoleApi from "@/modules/console-api";
import { exec } from "youtube-dl-exec";
import path from "path";

interface YoutubeUploadRequest {
	songname: string;
	songurl: string;
	originalLink: string;
}

interface YoutubeUploadResult {
	success: boolean;
	message: string;
	songId?: number;
}

// генерация случайной строки для имени файла
function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function generateRandomString(): Promise<string> {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const randomLetters = `${letters[getRandomInt(0, 25)]}${letters[getRandomInt(0, 25)]}`;
	const randomNumbers = `${getRandomInt(111111, 999999).toString().padStart(6, "0")}`;
	return `${randomLetters}_${randomNumbers}`;
}

// проверка размера файла
async function checkFileSize(url: string): Promise<string> {
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

// проверка на дубликат песни
async function checkSongDuplicate(db: Connection, originalLink: string): Promise<number> {
	const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM songs WHERE originalLink = ?", [originalLink]);
	if (rows.length > 0) {
		return rows[0].ID;
	}
	return 0;
}

// загрузка видео с YouTube
async function downloadYoutubeAudio(videoUrl: string, gdpsid: string, filename: string): Promise<boolean> {
	const outputPath = path.join(__dirname, "..", "..", "public", gdpsid, "music", `${filename}.mp3`);
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
					ConsoleApi.Log("main", `Panel action: downloaded from youtube: ${outputPath}`);
					resolve();
				})
				.catch(error => {
					ConsoleApi.Error(
						"main",
						`Panel action: failed to download from youtube: ${error} at net.fimastgd.forevercore.panel.music.youtube`
					);
					reject(error);
				});
		});
		return true;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.youtube`);
		return false;
	}
}

// сохранение информации о песне в базу данных
async function saveSongToDatabase(
	gdpsid: string, 
	songName: string, 
	songUrl: string, 
	size: string | number, 
	originalLink: string
): Promise<string> {
	try {
		const db = await threadConnection(gdpsid);
		if (size === "Unknown") {
			return "UnknownSongException:0";
		}
		const query = `INSERT INTO songs (ID, name, authorID, authorName, size, download, originalLink)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

		const [result] = await db.execute<ResultSetHeader>(query, [
			null, 
			songName, 
			8, 
			"Forever Music [YT]", 
			size, 
			songUrl, 
			originalLink
		]);

		const lastID = result.insertId.toString();
		ConsoleApi.Log("main", `Panel action: uploaded YouTube music. ID: ${lastID}`);
		return `Success:${lastID}`;
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.youtube`);
		return "UnknownSongException:0";
	}
}

// основная функция обработки YouTube загрузки
async function processYoutubeUpload(
	gdpsid: string, 
	requestData: YoutubeUploadRequest,
	protocol: string,
	host: string
): Promise<string> {
	try {
		const db = await threadConnection(gdpsid);
		const { songname, songurl: originalVideoUrl, originalLink } = requestData;

		// проверка на дубликат
		const duplicateId = await checkSongDuplicate(db, originalLink);
		if (duplicateId > 0) {
			return `DublicateSongException:${duplicateId}`;
		}
		// генерация имени файла
		const randomFilename = await generateRandomString();
		const finalSongUrl = `${protocol}://${host}/${gdpsid}/music/${randomFilename}.mp3`;
		// загрузка аудио
		const downloadSuccess = await downloadYoutubeAudio(originalVideoUrl, gdpsid, randomFilename);
		if (!downloadSuccess) {
			return "UnknownSongException:0";
		}
		// проверка размера файла
		const fileSize = await checkFileSize(finalSongUrl);
		const size = fileSize !== "Undefined" ? fileSize : "Unknown";
		// сохранение в базу данных
		return await saveSongToDatabase(gdpsid, songname, finalSongUrl, size, originalLink);
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.music.youtube`);
		return "UnknownSongException:0";
	}
}

export default processYoutubeUpload;
export { 
	processYoutubeUpload,
	checkSongDuplicate,
	downloadYoutubeAudio,
	saveSongToDatabase,
	checkFileSize,
	generateRandomString
};