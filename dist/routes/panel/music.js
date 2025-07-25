'package net.fimastgd.forevercore.routes.panel.music';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const axios_1 = __importDefault(require("axios"));
const settings_1 = require("../../serverconf/settings");
const captcha_1 = require("../../serverconf/captcha");
const newgrounds_1 = __importDefault(require("../../panel/music/newgrounds"));
const zemu_1 = __importDefault(require("../../panel/music/zemu"));
const link_1 = __importDefault(require("../../panel/music/link"));
const dropbox_1 = __importDefault(require("../../panel/music/dropbox"));
const youtube_1 = __importDefault(require("../../panel/music/youtube"));
const list_1 = __importDefault(require("../../panel/music/list"));
const music_1 = require("../../serverconf/music");
const path_1 = __importDefault(require("path"));
const youtube_dl_exec_1 = require("youtube-dl-exec");
const console_api_1 = __importDefault(require("../../modules/console-api"));
const db = require("../../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function generateRandomString() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = `${letters[getRandomInt(0, 25)]}${letters[getRandomInt(0, 25)]}`;
    const randomNumbers = `${getRandomInt(111111, 999999).toString().padStart(6, '0')}`;
    return `${randomLetters}_${randomNumbers}`;
}
/*(async () => {
    const randomString = await generateRandomString();
    console.log(randomString);
})();*/
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.get('/', async (req, res) => {
    res.render('errors/404');
});
router.get('/list', async (req, res) => {
    if (!req.cookies.username) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/music/list', opened by ${req.cookies.username}`);
    let offset;
    // console.log(req.query.offset)
    offset = 0;
    const page = 0;
    const table = await (0, list_1.default)(offset);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, rows: table, page: page };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/music/list'`);
    res.render("panel/music/list", data);
    return;
});
router.get('/list/:offset', async (req, res) => {
    if (!req.cookies.username) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    let offset;
    const offsetParam = req.params.offset;
    const offsetSplit = offsetParam ? offsetParam.split(".") : [];
    if (offsetSplit[0] === "offset") {
        offset = parseInt(offsetSplit[1], 10);
    }
    else {
        offset = 0;
    }
    // console.log(offset);
    const table = await (0, list_1.default)(offset);
    const page = parseInt(offsetSplit[1], 10);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, rows: table, page: page };
    res.render("panel/music/list", data);
    return;
});
router.get('/:route', async (req, res) => {
    const ROUTE = req.params.route;
    if (ROUTE === "newgrounds") {
        if (!req.cookies.username) {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        console_api_1.default.Log("Query thread", `Handled new session '/panel/music/newgrounds', opened by ${req.cookies.username}`);
        const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID };
        console_api_1.default.Log("Render thread", `Rendered page '/panel/music/newgrounds'`);
        res.render("panel/music/newgrounds", data);
    }
    else if (ROUTE === "zemu") {
        if (!req.cookies.username) {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        console_api_1.default.Log("Query thread", `Handled new session '/panel/music/zemu', opened by ${req.cookies.username}`);
        const musicConfig = (0, music_1.getMusicState)('main'); // TODO: Get gdpsid from request
        if (musicConfig.zemu) {
            const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID };
            console_api_1.default.Log("Render thread", `Rendered page '/panel/music/zemu'`);
            res.render("panel/music/zemu", data);
        }
        else {
            res.send("ZeMu is not available for your GDPS");
        }
    }
    else if (ROUTE === "link") {
        if (!req.cookies.username) {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        console_api_1.default.Log("Query thread", `Handled new session '/panel/music/link', opened by ${req.cookies.username}`);
        const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, captchaKey: captcha_1.captcha.key };
        console_api_1.default.Log("Render thread", `Rendered page '/panel/music/link'`);
        res.render("panel/music/link", data);
    }
    else if (ROUTE === "dropbox") {
        if (!req.cookies.username) {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        console_api_1.default.Log("Query thread", `Handled new session '/panel/music/dropbox', opened by ${req.cookies.username}`);
        const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, captchaKey: captcha_1.captcha.key };
        console_api_1.default.Log("Render thread", `Rendered page '/panel/music/dropbox'`);
        res.render("panel/music/dropbox", data);
        return;
    }
    else if (ROUTE === "youtube") {
        if (!req.cookies.username) {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
        console_api_1.default.Log("Query thread", `Handled new session '/panel/music/youtube', opened by ${req.cookies.username}`);
        const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, captchaKey: captcha_1.captcha.key };
        console_api_1.default.Log("Render thread", `Rendered page '/panel/music/youtube'`);
        res.render("panel/music/youtube", data);
        return;
    }
    else {
        res.render('errors/404');
        return;
    }
});
// POST
router.post('/newgrounds', async (req, res) => {
    const result = await (0, newgrounds_1.default)(req.body.songid);
    res.status(200).send(result);
});
router.post('/zemu', async (req, res) => {
    const musicConfig = (0, music_1.getMusicState)('main'); // TODO: Get gdpsid from request
    if (musicConfig.zemu) {
        const result = await (0, zemu_1.default)(req.body.songid);
        res.status(200).send(result);
    }
    else {
        res.status(500).send("ZeMu is not available for your GDPS");
    }
});
router.post('/link', async (req, res) => {
    const hCaptchaSecret = captcha_1.captcha.secret;
    const hCaptchaResponse = req.body.captchaResponse;
    const data = new URLSearchParams({
        'secret': hCaptchaSecret,
        'response': hCaptchaResponse
    });
    const response = await axios_1.default.post('https://hcaptcha.com/siteverify', data);
    const responseData = response.data;
    const resp = responseData.success;
    let captchaResult;
    if (resp === true) {
        captchaResult = "1";
    }
    else {
        captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
    }
    if (captchaResult === "-1") {
        res.status(200).send("CapchaIsNotCompleted:0");
        return;
    }
    async function checkFile(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const sizeInBytes = response.headers.get('content-length');
                if (sizeInBytes) {
                    const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
                    return `${sizeInMB}`;
                }
            }
            return "Undefined";
        }
        catch (error) {
            return "Undefined";
        }
    }
    let SIZE;
    const fileSize = await checkFile(req.body.songurl);
    SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
    const array = [req.body.songname, req.body.songurl, SIZE];
    const result = await (0, link_1.default)(array);
    res.status(200).send(result);
});
// DROPBOX
router.post('/dropbox', async (req, res) => {
    const hCaptchaSecret = captcha_1.captcha.secret;
    const hCaptchaResponse = req.body.captchaResponse;
    const data = new URLSearchParams({
        'secret': hCaptchaSecret,
        'response': hCaptchaResponse
    });
    const response = await axios_1.default.post('https://hcaptcha.com/siteverify', data);
    const responseData = response.data;
    const resp = responseData.success;
    let captchaResult;
    if (resp === true) {
        captchaResult = "1";
    }
    else {
        captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
    }
    if (captchaResult === "-1") {
        res.status(200).send("CapchaIsNotCompleted:0");
        return;
    }
    async function checkFile(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const sizeInBytes = response.headers.get('content-length');
                if (sizeInBytes) {
                    const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
                    return `${sizeInMB}`;
                }
                else {
                    return "0.01";
                }
            }
            return "Undefined";
        }
        catch (error) {
            return "Undefined";
        }
    }
    let SIZE;
    const fileSize = await checkFile(req.body.songurl);
    SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
    const array = [req.body.songname, req.body.songurl, SIZE];
    const result = await (0, dropbox_1.default)(array);
    res.status(200).send(result);
});
// YOUTUBE
router.post('/youtube', async (req, res) => {
    const hCaptchaSecret = captcha_1.captcha.secret;
    const hCaptchaResponse = req.body.captchaResponse;
    const originalLink = req.body.songurl;
    const data = new URLSearchParams({
        'secret': hCaptchaSecret,
        'response': hCaptchaResponse
    });
    const response = await axios_1.default.post('https://hcaptcha.com/siteverify', data);
    const responseData = response.data;
    const resp = responseData.success;
    let captchaResult;
    if (resp === true) {
        captchaResult = "1";
    }
    else {
        captchaResult = hCaptchaResponse === "1" ? "1" : "-1";
    }
    if (captchaResult === "-1") {
        res.status(200).send("CapchaIsNotCompleted:0");
        return;
    }
    async function checkFile(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const sizeInBytes = response.headers.get('content-length');
                if (sizeInBytes) {
                    const sizeInMB = (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2);
                    return `${sizeInMB}`;
                }
            }
            return "Undefined";
        }
        catch (error) {
            return "Undefined";
        }
    }
    const rstr = await generateRandomString();
    const songurl = settings_1.settings.serverURL + `/music/${rstr}.mp3`;
    let isTimeOverload = 0;
    let isUnknownSong = 0;
    let isSongDublicate = false;
    async function checkSong() {
        const [rows] = await db.query('SELECT * FROM songs WHERE originalLink = ?', [originalLink]);
        if (rows.length > 0) {
            isSongDublicate = true;
            return rows[0].ID;
        }
        else {
            return 0;
        }
    }
    await checkSong();
    async function download(videoUrl, GDPSID) {
        const outputPath = path_1.default.join(__dirname, '..', '..', 'public', 'music', `${rstr}.mp3`);
        const cookiesPath = path_1.default.join(__dirname, '..', '..', 'serverconf', 'youtube_cookies.txt');
        try {
            await new Promise((resolve, reject) => {
                (0, youtube_dl_exec_1.exec)(videoUrl, {
                    output: outputPath,
                    extractAudio: true,
                    audioFormat: 'mp3',
                    ffmpegLocation: '/usr/bin/ffmpeg',
                    cookies: cookiesPath
                }).then(output => {
                    //console.log('Download finished:', outputPath);
                    console_api_1.default.Log("main", `Panel action: downloaded from youtube: ${outputPath}`);
                    resolve();
                }).catch(error => {
                    console_api_1.default.Error("main", `Panel action: failed to download from youtube: ${error} at net.fimastgd.forevercore.routes.panel.music`);
                    reject(error);
                });
            });
        }
        catch (error) {
            console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.routes.panel.music`);
            isUnknownSong = 1;
        }
    }
    if (!isSongDublicate) {
        await download(req.body.songurl, GDPSID);
    }
    let SIZE;
    const fileSize = await checkFile(songurl);
    SIZE = fileSize !== "Undefined" ? fileSize : "Unknown";
    let result;
    if (isTimeOverload == 0 && isUnknownSong == 0 && isSongDublicate == false) {
        // console.log("Writing to DB...");
        const array = [req.body.songname, songurl, SIZE, originalLink];
        // [4]
        // checkMemory();
        result = await (0, youtube_1.default)(array);
        // [5]
        // checkMemory();
    }
    else if (isUnknownSong == 1) {
        result = "UnknownSongException:0";
    }
    else if (isSongDublicate) {
        result = `DublicateSongException:${await checkSong()}`;
    }
    else {
        result = "SizeOverload:0";
    }
    // console.log("RESULT:", result);
    await res.status(200).send(result);
    return;
});
exports.default = router;
