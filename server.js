'package net.fimastgd.forevercore';

const fs = require('fs');
const path = require('path'); 
const $_EMPTYSTRING = "";

const clearLatest = () => {
	const pathlatest = path.join(__dirname, 'logs', 'latest.log');
	fs.writeFileSync(pathlatest, $_EMPTYSTRING, 'utf-8');
	return;
};
const clearStreamLog = () => {
	const pathstream = path.join(__dirname, 'logs', 'stream.log');
	fs.writeFileSync(pathstream, $_EMPTYSTRING, 'utf-8');
};

const c = require("ansi-colors");
const ConsoleApi = require('./modules/console-api');

const NOGUI = process.argv.includes('--nogui');
if (NOGUI) {
	console.log('\n ' + c.bgYellow('                                              '));
	console.log(' ' + c.bgYellow.black(' Будьте осторожны, риск несохранения данных:  '));
	console.log(' ' + c.bgYellow.black(' Флаг --nogui используйте только в production '));
	console.log(' ' + c.bgYellow('                                              \n'));
}


clearLatest();
clearStreamLog();
ConsoleApi.Log("Server thread", "Using package net.fimastgd.forevercore", true);


const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const url = require("url");
const cors = require("cors");
//const mysql = require("mysql2/promise");
const settings = require("./serverconf/settings");
const db = require("./serverconf/db");
//const ApiLib = require("./api/lib/apiLib");

const AnsiToHtml = require('ansi-to-html');
const convert = new AnsiToHtml();

const registerAccount = require("./api/accounts/register");
const getAccountURL = require("./api/lib/getAccountURL");
const loginAccount = require("./api/accounts/login");
const backupAccount = require("./api/accounts/backup");
const syncAccount = require("./api/accounts/sync");
const getUserInfo = require("./api/accounts/getUserInfo");
const updateUserScore = require("./api/scores/updateUserScore");
const getAccountComments = require("./api/comments/getAccountComments");
const uploadAccountComment = require("./api/comments/uploadAccountComment");
const deleteAccountComment = require("./api/comments/deleteAccountComment");
const likeItem = require("./api/other/likeItem");
const getScores = require("./api/scores/getScores");
const uploadLevel = require("./api/levels/uploadLevel");
const getLevels = require("./api/levels/getLevels");
const downloadLevel = require("./api/levels/downloadLevel");
const deleteLevelUser = require("./api/levels/deleteLevelUser");
const rateStars = require("./api/levels/rateStars");
const uploadComment = require("./api/comments/uploadComment");
const getComments = require("./api/comments/getComments");
const deleteComment = require("./api/comments/deleteComment");
const requestUserAccess = require("./api/mods/requestUserAccess");
const getDailyLevel = require("./api/levels/getDailyLevel");
const suggestStars = require("./api/levels/suggestStars");
const rateDemon = require("./api/levels/rateDemon");
const reportLevel = require("./api/levels/reportLevel");
const updateDesc = require("./api/levels/updateDesc");
const getSongInfo = require("./api/other/getSongInfo");
const topArtists = require("./api/other/topArtists");
const getChallenges = require("./api/rewards/getChallenges");
const getChests = require("./api/rewards/getChests");
const getUsers = require("./api/accounts/getUsers");
const updateSettings = require("./api/accounts/updateSettings");
const uploadMessage = require("./api/communication/uploadMessage");
const getMessages = require("./api/communication/getMessages");
const downloadMessage = require("./api/communication/downloadMessage");
const deleteMessages = require("./api/communication/deleteMessages");
const getCreators = require("./api/scores/getCreators");
const getLevelScores = require("./api/scores/getLevelScores");
const getLevelScoresPlat = require("./api/scores/getLevelScoresPlat");
const uploadFriendRequest = require("./api/friendships/uploadFriendRequest");
const acceptFriendRequest = require("./api/friendships/acceptFriendRequest");
const getFriendRequests = require("./api/friendships/getFriendRequests");
const readFriendRequest = require("./api/friendships/readFriendRequest");
const getUserList = require("./api/friendships/getUserList");
const removeFriend = require("./api/friendships/removeFriend");
const deleteFriendRequests = require("./api/friendships/deleteFriendRequests");
const blockUser = require("./api/friendships/blockUser");
const unblockUser = require("./api/friendships/unblockUser");
const getGauntlets = require("./api/packs/getGauntlets");
const getMapPacks = require("./api/packs/getMapPacks");
const uploadList = require("./api/packs/lists/uploadList");
const getLists = require("./api/packs/lists/getLists");
const deleteList = require("./api/packs/lists/deleteList");

const panelAccounts = require('./routes/panel/accounts');
const panelMain = require('./routes/panel/main');
const panelMusic = require('./routes/panel/music').default;
const panelLists = require('./routes/panel/lists').default;
const panelLeaderboard = require('./routes/panel/leaderboard').default;
const panelPacks = require('./routes/panel/packs').default;
const panelRoles = require('./routes/panel/roles').default;

const cmd = require('./routes/cmd/cmd').default;
const serverlife = require('./routes/serverlife').default;

app.set("view engine", "ejs");
app.use(cors());
app.use(express.static("public"));
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/panel/accounts', panelAccounts);
app.use('/panel', panelMain);
app.use('/panel/music', panelMusic);
app.use('/panel/lists', panelLists);
app.use('/panel/leaderboard', panelLeaderboard);
app.use('/panel/packs', panelPacks);
app.use('/panel/roles', panelRoles);
app.use('/cmd', cmd);
app.use('/serverlife', serverlife);

const TS_handler = require("./tslib/TS_handler").default;
TS_handler();

// /!\ BETA AREA /!\ //
// [ START ]

// [ END ]

const readline = require('readline');


const pluginsDir = path.join(__dirname, 'plugins');
fs.readdirSync(pluginsDir).forEach(file => {
    const pluginPath = path.join(pluginsDir, file);
    try {
        const plugin = require(pluginPath);
        if (typeof plugin === 'function') {
            plugin(app);
            ConsoleApi.Log("Anvil PluginLoader", `Plugin ${file} loaded successfully.`);
        } else {
            ConsoleApi.Error("Anvil PluginLoader", `Plugin ${file} is not a correct plugin function, loading ignored.`);
        }
    } catch (error) {
        ConsoleApi.FatalError("Anvil PluginLoader", `Error loading plugin ${file}:`, error, 'at net.fimastgd.forevercore');
    }
});


function dateNow() {
	const currentDate = new Date();
	const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
	return fDate;
} 

var GDPSID = settings.GDPSID.replace(/\//g, "");
GDPSID = GDPSID.toString();

// HOME PAGE
if (GDPSID != "") {
	app.get("/" + GDPSID, (req, res) => {
		res.send("Hi NodeJS!");
	});
}
app.get("/", (req, res) => {
	res.send("Hi NodeJS!");
});

// MAIN ROUTES
app.post("/accounts/registerGJAccount.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/registerGJAccount.php"`);
	const result = await registerAccount(req.body.userName, req.body.password, req.body.email);
	res.status(200).send(result);
});
app.post("/accounts/loginGJAccount.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/loginGJAccount.php"`);
    const result = await loginAccount(req.body.userName, req.body.udid, req.body.password, req.body.gjp2, req);
    res.status(200).send(result);
});
app.post("/accounts/backupGJAccount.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/backupGJAccount.php"`);
	const result = await backupAccount(req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/accounts/backupGJAccount20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/backupGJAccount20.php"`);
	const result = await backupAccount(req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/database/accounts/backupGJAccountNew.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/database/accounts/backupGJAccountNew.php"`);
	const result = await backupAccount(req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/accounts/syncGJAccount.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/syncGJAccount.php"`);
	const result = await syncAccount(req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/accounts/syncGJAccount20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/accounts/syncGJAccount20.php"`);
	const result = await syncAccount(req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/database/accounts/syncGJAccountNew.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/database/accounts/syncGJAccountNew.php"`);
	const result = await syncAccount(req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/getGJUserInfo20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJUserInfo20.php"`);
	const result = await getUserInfo(req.body.targetAccountID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/updateGJUserScore22.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJUserScore22.php"`);
	const { accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp } = req.body;
	const result = await updateUserScore(accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/updateGJUserScore21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJUserScore21.php"`);
	const { accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp } = req.body;
	const result = await updateUserScore(accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/updateGJUserScore20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJUserScore20.php"`);
	const { accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp } = req.body;
	const result = await updateUserScore(accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/updateGJUserScore19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJUserScore19.php"`);
	const { accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp } = req.body;
	const result = await updateUserScore(accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/updateGJUserScore.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJUserScore.php"`);
	const { accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp } = req.body;
	const result = await updateUserScore(accountID, userName, secret, stars, demons, icon, color1, color2, gameVersion, binaryVersion, coins, iconType, userCoins, special, accIcon, accShip, accBall, accBird, accDart, accRobot, accGlow, accSpider, accExplosion, diamonds, moons, color3, accSwing, accJetpack, dinfo, dinfow, dinfog, sinfo, sinfod, sinfog, udid, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/getGJAccountComments20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJAccountComments20.php"`);
	const result = await getAccountComments(req.body.accountID, req.body.page, req);
	res.status(200).send(result);
});
app.post("/uploadGJAccComment20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJAccountComment20.php"`);
	const { userName, accountID, comment, gjp, gjp2 } = req.body;
	const result = await uploadAccountComment(userName, accountID, comment, gjp, gjp2, req);
	res.status(200).send(result);
});
app.post("/deleteGJAccComment20.php", async (req, res) => {
	const { commentID, accountID, gjp2, gjp } = req.body;
	const result = await deleteAccountComment(commentID, accountID, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/likeGJItem.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/likeGJItem.php"`);
	const { type, like, itemID } = req.body;
	const result = await likeItem(type, like, itemID, req);
	res.status(200).send(result);
});
app.post("/likeGJItem19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/likeGJItem19.php"`);
	const { type, like, itemID } = req.body;
	const result = await likeItem(type, like, itemID, req);
	res.status(200).send(result);
});
app.post("/likeGJItem20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/likeGJItem20.php"`);
	const { type, like, itemID } = req.body;
	const result = await likeItem(type, like, itemID, req);
	res.status(200).send(result);
});
app.post("/likeGJItem21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/likeGJItem21.php"`);
	const { type, like, itemID } = req.body;
	const result = await likeItem(type, like, itemID, req);
	res.status(200).send(result);
});
app.post("/likeGJItem211.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/likeGJItem211.php"`);
	const { type, like, itemID } = req.body;
	const result = await likeItem(type, like, itemID, req);
	res.status(200).send(result);
});
app.post("/getGJScores.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJScores.php"`);
	const { gameVersion, accountID, udid, type, count, gjp2, gjp } = req.body;
	const result = await getScore(gameVersion, accountID, udid, type, count, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/getGJScores19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJScores19.php"`);
	const { gameVersion, accountID, udid, type, count, gjp2, gjp } = req.body;
	const result = await getScores(gameVersion, accountID, udid, type, count, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/getGJScores20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJScores20.php"`);
	const { gameVersion, accountID, udid, type, count, gjp2, gjp } = req.body;
	const result = await getScores(gameVersion, accountID, udid, type, count, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/uploadGJLevel.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJLevel.php"`);
	const { password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts } = req.body;
	const result = await uploadLevel(password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req);
	res.status(200).send(result);
});
app.post("/uploadGJLevel19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJLevel19.php"`);
	const { password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts } = req.body;
	const result = await uploadLevel(password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req);
	res.status(200).send(result);
});
app.post("/uploadGJLevel20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJLevel20.php"`);
	const { password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts } = req.body;
	const result = await uploadLevel(password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req);
	res.status(200).send(result);
});
app.post("/uploadGJLevel21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJLevel21.php"`);
	const { password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts } = req.body;
	const result = await uploadLevel(password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req);
	res.status(200).send(result);
});
app.post("/getGJLevels.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevels.php"`);
	const { gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2 } = req.body;
	const result = await getLevels(gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2, req);
	res.status(200).send(result);
});
app.post("/getGJLevels19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevels19.php"`);
	const { gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2 } = req.body;
	const result = await getLevels(gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2, req);
	res.status(200).send(result);
});
app.post("/getGJLevels20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevels20.php"`);
	const { gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2 } = req.body;
	const result = await getLevels(gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2, req);
	res.status(200).send(result);
});
app.post("/getGJLevels21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevels21.php"`);
	const result = await getLevels(req.body.gameVersion, req.body.binaryVersion, req.body.type, req.body.diff, req.body.uncompleted, req.body.original, req.body.coins, req.body.completedLvls, req.body.onlyCompleted, req.body.song, req.body.customSong, req.body.twoPlayer, req.body.star, req.body.noStar, req.body.gauntlet, req.body.len, req.body.featured, req.body.epic, req.body.mythic, req.body.legendary, req.body.demonFilter, req.body.str, req.body.page, req.body.followed, req.body.accountID, req.body.gjp, req.body.gjp2, req);
	res.status(200).send(result);
});
app.post("/downloadGJLevel.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJLevel.php"`);
	const result = await downloadLevel(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
	res.status(200).send(result);
});
app.post("/downloadGJLevel19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJLevel19.php"`);
	const result = await downloadLevel(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
	res.status(200).send(result);
});
app.post("/downloadGJLevel20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJLevel20.php"`);
	const result = await downloadLevel(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
	res.status(200).send(result);
});
app.post("/downloadGJLevel21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJLevel21.php"`);
	const result = await downloadLevel(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
	res.status(200).send(result);
});
app.post("/downloadGJLevel22.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJLevel22.php"`);
	const result = await downloadLevel(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
	res.status(200).send(result);
});
app.post("/deleteGJLevelUser20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/deleteGJLevelUser20.php"`);
	const result = await deleteLevelUser(req.body.levelID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/rateGJStars20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/rateGJStars20.php"`);
	const result = await rateStars(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.stars, req.body.levelID, req);
	res.status(200).send(result);
});
app.post("/rateGJStars211.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/rateGJStars211.php"`);
	const result = await rateStars(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.stars, req.body.levelID, req);
	res.status(200).send(result);
});
app.post("/uploadGJComment.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJComment.php"`);
	const result = await uploadComment(req.body.userName, req.body.gameVersion, req.body.comment, req.body.levelID, req.body.percent, req.body.udid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/uploadGJComment19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJComment19.php"`);
	const result = await uploadComment(req.body.userName, req.body.gameVersion, req.body.comment, req.body.levelID, req.body.percent, req.body.udid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/uploadGJComment20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJComment20.php"`);
	const result = await uploadComment(req.body.userName, req.body.gameVersion, req.body.comment, req.body.levelID, req.body.percent, req.body.udid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/uploadGJComment21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJComment21.php"`);
	const result = await uploadComment(req.body.userName, req.body.gameVersion, req.body.comment, req.body.levelID, req.body.percent, req.body.udid, req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/getGJComments.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJComments.php"`);
	const result = await getComments(req.body.binaryVersion, req.body.gameVersion, req.body.mode, req.body.count, req.body.page, req.body.levelID, req.body.userID);
	res.status(200).send(result);
});
app.post("/getGJComments19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJComments19.php"`);
	const result = await getComments(req.body.binaryVersion, req.body.gameVersion, req.body.mode, req.body.count, req.body.page, req.body.levelID, req.body.userID);
	res.status(200).send(result);
});
app.post("/getGJComments20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJComments20.php"`);
	const result = await getComments(req.body.binaryVersion, req.body.gameVersion, req.body.mode, req.body.count, req.body.page, req.body.levelID, req.body.userID);
	res.status(200).send(result);
});
app.post("/getGJComments21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJComments21.php"`);
	const result = await getComments(req.body.binaryVersion, req.body.gameVersion, req.body.mode, req.body.count, req.body.page, req.body.levelID, req.body.userID);
	res.status(200).send(result);
});
app.post("/deleteGJComment20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/deleteGJComment20.php"`);
	const result = await deleteComment(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.commentID, req);
	res.status(200).send(result);
});
app.post("/requestUserAccess.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/requestUserAccess.php"`);
	const result = await requestUserAccess(req.body.accountID, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/getGJDailyLevel.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJDailyLevel.php"`);
	const result = await getDailyLevel(req.body.type, req.body.weekly);
	res.status(200).send(result);
});
app.post("/suggestGJStars20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/suggestGJStars20.php"`);
	console.log(req.body.gjp2, req.body.gjp, req.body.stars, req.body.feature, req.body.levelID, req.body.accountID);
	const result = await suggestStars(req.body.gjp2, req.body.gjp, req.body.stars, req.body.feature, req.body.levelID, req.body.accountID, req);
	res.status(200).send(result);
});
app.post("/rateGJDemon21.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/rateGJDemon21.php"`);
	const result = await rateDemon(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.rating, req.body.levelID, req);
	res.status(200).send(result);
});
app.post("/reportGJLevel.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/reportGJLevel.php"`);
	const { levelID } = req.body;
	const result = await reportLevel(levelID, req);
	res.status(200).send(result);
});
app.post("/updateGJDesc20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJDesc20.php"`);
	const { accountID, gjp2, gjp, levelID, levelDesc, udid } = req.body;
	const result = await updateDesc(accountID, gjp2, gjp, levelID, levelDesc, udid, req);
	res.status(200).send(result);
});
app.post("/getGJSongInfo.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJSongInfo.php"`);
	const { songID } = req.body;
	const result = await getSongInfo(songID);
	res.status(200).send(result);
});
app.post("/getGJTopArtists.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJTopArtists.php"`);
	const { page } = req.body;
	const result = await topArtists(page);
	res.status(200).send(result);
});
app.post("/getGJChallenges.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJChallenges.php"`);
	const { accountID, udid, chk } = req.body;
	const result = await getChallenges(accountID, udid, chk);
	res.status(200).send(result);
});
app.post("/getGJRewards.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJRewards.php"`);
	const result = await getChests(req.body.chk, req.body.rewardType, req.body.udid, req.body.accountID, req.body.gameVersion, req.body.gjp2, req.body.gjp, req);
	res.status(200).send(result);
});
app.post("/getGJUsers20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJUsers20.php"`);
	const { page, str } = req.body;
	const result = await getUsers(page, str);
	res.status(200).send(result);
});
app.post("/updateGJAccSettings20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/updateGJAccSettings20.php"`);
	const x = req.body.twitter; // осуждаю
	const result = await updateSettings(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.mS, req.body.frS, req.body.cS, req.body.yt, x, req.body.twitch, req);
	res.status(200).send(result);
});
app.post("/uploadGJMessage20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJMessage20.php"`);
	const { gameVersion, binaryVersion, secret, subject, toAccountID, body, accountID, gjp2, gjp } = req.body;
	const result = await uploadMessage(gameVersion, binaryVersion, secret, subject, toAccountID, body, accountID, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/getGJMessages20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJMessagess20.php"`);
	const { page, getSent, accountID, gjp2, gjp } = req.body;
	const result = await getMessages(page, getSent, accountID, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/downloadGJMessage20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/downloadGJMessage20.php"`);
	const { messageID, accountID, gjp2, gjp, isSender } = req.body;
	const result = await downloadMessage(messageID, accountID, gjp2, gjp, isSender, req);
	res.status(200).send(result);
});
app.post("/deleteGJMessages20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/deleteGJMessages20.php"`);
	const { messageID, messages, accountID, gjp2, gjp } = req.body;
	const result = await deleteMessages(messageID, messages, accountID, gjp2, gjp, req);
	res.status(200).send(result);
});
app.post("/getGJCreators.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJCreators.php"`);
	const { accountID, type } = req.body;
	const result = await getCreators(accountID, type);
	res.status(200).send(result);
});
app.post("/getGJCreators19.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJCreators19.php"`);
	const { accountID, type } = req.body;
	const result = await getCreators(accountID, type);
	res.status(200).send(result);
});
app.post("/getGJLevelScores.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevelScores.php"`);
	const { accountID, gjp2, gjp, levelID, percent, s1, s2, s3, s6, s9, s10, type } = req.body;
	const result = await getLevelScores(accountID, gjp2, gjp, levelID, percent, s1, s2, s3, s6, s9, s10, type, req);
	res.status(200).send(result);
});
app.post("/getGJLevelScores211.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevelScores211.php"`);
	const { accountID, gjp2, gjp, levelID, percent, s1, s2, s3, s6, s9, s10, type } = req.body;
	const result = await getLevelScores(accountID, gjp2, gjp, levelID, percent, s1, s2, s3, s6, s9, s10, type, req);
	res.status(200).send(result);
});
app.post("/getGJLevelScoresPlat.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevelScoresPlat.php"`);
	const result = await getLevelScoresPlat(req); // trying new method
	res.status(200).send(result);
});
app.post("/uploadFriendRequest20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadFriendRequest20.php"`);
	const { accountID, gjp2, gjp, toAccountID, comment } = req.body;
	const result = await uploadFriendRequest(accountID, gjp2, gjp, toAccountID, comment, req);
	res.status(200).send(result);
});
app.post("/acceptGJFriendRequest20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/acceptGJFriendRequest20.php"`);
	const result = await acceptFriendRequest(req);
	res.status(200).send(result);
});
app.post("/getGJFriendRequests20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJFriendRequests20.php"`);
	const result = await getFriendRequests(req);
	res.status(200).send(result);
});
app.post("/readGJFriendRequest20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/readGJFriendRequest20.php"`);
	const result = await readFriendRequest(req);
	res.status(200).send(result);
});
app.post("/getGJUserList20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJUserList20.php"`);
	const result = await getUserList(req);
	res.status(200).send(result);
});
app.post("/removeGJFriend20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/removeGJFriend20.php"`);
	const result = await removeFriend(req);
	res.status(200).send(result);
});
app.post("/deleteGJFriendRequests20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/deleteGJFriendRequests20.php"`);
	const result = await deleteFriendRequests(req);
	res.status(200).send(result);
});
app.post("/blockGJUser20.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to "/blockGJUser20.php"`);
	const result = await blockUser(req);
	res.status(200).send(result);
});
app.post("/unblockGJUser20.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/unblockGJUser20.php"`);
    const result = await unblockUser(req);
    res.status(200).send(result);
});
app.post("/getGJGauntlets.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJGauntlets.php"`);
    const result = await getGauntlets();
    res.status(200).send(result);
});
app.post("/getGJGauntlets21.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJGauntlets21.php"`);
    const result = await getGauntlets();
    res.status(200).send(result);
});
app.post("/getGJMapPacks.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJMapPacks.php"`);
    const result = await getMapPacks(req);
    res.status(200).send(result);
});
app.post("/getGJMapPacks20.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJMapPacks20.php"`);
    const result = await getMapPacks(req);
    res.status(200).send(result);
});
app.post("/getGJMapPacks21.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJMapPacks21.php"`);
    const result = await getMapPacks(req);
    res.status(200).send(result);
});
app.post("/uploadGJLevelList.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/uploadGJLevelList.php"`);
    const result = await uploadList(req);
    res.status(200).send(result);
});
app.post("/getGJLevelLists.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/getGJLevelLists.php"`);
    const result = await getLists(req);
    res.status(200).send(result);
});
app.post("/deleteGJLevelList.php", async (req, res) => {
    // console.log(`[${dateNow()}] [main/INFO]: POST query to "/deleteGJLevelList.php"`);
    const result = await deleteList(req);
    res.status(200).send(result);
});

// ADDITIONAL ROUTES
app.post("/getAccountURL.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to /getAccountURL.php`);
	res.status(200).send(settings.serverURL);
})
app.post("/getCustomContentURL.php", async (req, res) => {
	// console.log(`[${dateNow()}] [main/INFO]: POST query to /getCustomContentURL.php`);
	res.status(200).send("https://geometrydashfiles.b-cdn.net");
});

// CONSOLE STREAM
/* app.get('/console', (req, res) => {
    res.render('console');
}); */
app.post('/console', (req, res) => {
    const logFilePath = path.join(__dirname, 'logs', 'stream.log');
    fs.readFile(logFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading log file.');
        }
        const htmlLog = convert.toHtml(data.replace(/\n/g, '<br>'));
        res.send(htmlLog);
    });
});



// ERRORS
app.use((req, res, next) => {
  res.status(404).render('errors/404', { url: req.originalUrl });
});



const PORT = parseInt(settings.PORT);
app.listen(PORT, () => {
	// console.log(c.greenBright(`[${dateNow()}] [main/SYSTEM]: GDPS Engine started!`));
	ConsoleApi.Log$LightGreen("main", "GDPS Engine started!");
	if (!NOGUI) {
		const rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
	
		rl.on('line', (input) => {
		    if (input.trim() === 'stop') {
				ConsoleApi.Write("> stop", true, false);
				ConsoleApi.Log('FLS system', "Saving level chunks... [ IN FUTURE ]");
				ConsoleApi.Log('FLS system', "Saving account chunks... [ IN FUTURE ]");
				ConsoleApi.Log('main', "Stopping database server...");
				db.end();
				ConsoleApi.Log('main', "Stopping server...");
				ConsoleApi.Log('Server thread', "----- [ SERVER STOPPED ] -----"); 
				process.exit(0);
		    } else if (input.trim().split(' ')[0] === 'op') {
				ConsoleApi.Write(`> ${input.trim()}`, true, false);
				const { Roles } = require('./panel/roles/roles');
				const roles = new Roles();
				const username = input.trim().split(' ')[1];

				roles.setRole(username, 1)
					.then(opuser => {
						if (opuser) {
							ConsoleApi.Log("main", `${username} opped`);
						} else {
							ConsoleApi.Error("main", `Failed to op ${username}`);
						}
					})
					.catch(error => {
						ConsoleApi.Error("main", `Error during setRole in "op" command: ${error.message} at net.fimastgd.forevercore`);
					});
		    } else if (input.trim().split(' ')[0] === 'deop') {
				ConsoleApi.Write(`> ${input.trim()}`, true, false);
				const { Roles } = require('./panel/roles/roles');
				const roles = new Roles();
				const username = input.trim().split(' ')[1];

				roles.unsetRole(username, 1)
					.then(opuser => {
						if (opuser) {
							ConsoleApi.Log("main", `${username} deopped`);
						} else {
							ConsoleApi.Error("main", `Failed to deop ${username}`);
						}
					})
					.catch(error => {
						ConsoleApi.Error("main", `Error during unsetRole in "deop" command: ${error.message} at net.fimastgd.forevercore`);
					});
		    } else if (input.trim() === '') {
			    // nothing
		    } else {
				ConsoleApi.Write(`> ${input.trim()}`, true, false);
				ConsoleApi.Error('Line thread', `Unknown command "${input}" loaded in main thread at net.fimastgd.forevercore`);
		    }
		});
	}
});
