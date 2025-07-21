'package net.fimastgd.forevercore.routes.panel.packs';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const settings_1 = require("../../serverconf/settings");
const main_1 = __importDefault(require("../../panel/main"));
const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;
const mappacks_1 = __importDefault(require("../../panel/packs/mappacks"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const gauntlets_1 = require("../../panel/packs/gauntlets");
const db = require("../../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.get('/', async (req, res) => {
    res.render('errors/404');
});
router.get('/mappacks', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/packs/mappacks', opened by ${req.cookies.username}`);
    const mapPacks = await (0, mappacks_1.default)();
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: mapPacks, username: req.cookies.username.toString(), packData: undefined };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/mappacks'`);
    res.render("panel/packs/mappacks", data);
    return;
});
// редактор мап паков
router.get('/mappacks/edit/:id', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/packs/mappacks/edit/${req.params.id}', opened by ${req.cookies.username}`);
    const packID = req.params.id;
    const mappackData = await main_1.default.getMappackData(packID);
    const map = [
        mappackData.packName,
        mappackData.levels,
        (mappackData.stars == undefined) ? undefined : mappackData.stars.toString(),
        (mappackData.coins == undefined) ? undefined : mappackData.coins.toString(),
        (mappackData.difficulty == undefined) ? undefined : mappackData.difficulty.toString(),
        mappackData.rgbcolors,
        packID
    ];
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: map };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/mappacks/edit/${packID}'`);
    res.render("panel/packs/mappacks-edit", data);
    return;
});
router.get('/mappacks/create', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/packs/mappacks/create', opened by ${req.cookies.username}`);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: undefined };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/mappacks/create'`);
    res.render("panel/packs/mappacks-create", data);
    return;
});
// ГАУНТЛЕТЫ
router.get('/gauntlets', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/packs/gauntlets', opened by ${req.cookies.username}`);
    const gauntlets = await (0, gauntlets_1.getGauntlets)();
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: gauntlets, username: req.cookies.username.toString(), packData: undefined };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/gauntlets'`);
    res.render("panel/packs/gauntlets", data);
    return;
});
router.get('/gauntlets/create', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/packs/gauntlets/create', opened by ${req.cookies.username}`);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: undefined };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/gauntlets/create'`);
    res.render("panel/packs/gauntlets-create", data);
    return;
});
// редактор гаунтлетов
router.get('/gauntlets/edit/:id', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        if (settings_1.settings.GDPSID != "") {
            res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
        }
        else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
    const packID = req.params.id;
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/gauntlets/edit/${packID}'`);
    const gauntletData = await main_1.default.getGauntletData(packID);
    const map = [
        packID,
        gauntletData.level1,
        gauntletData.level2,
        gauntletData.level3,
        gauntletData.level4,
        gauntletData.level5
    ];
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: map };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/packs/gauntlets/edit/${packID}'`);
    res.render("panel/packs/gauntlets-edit", data);
    return;
});
// POST
router.post('/mappacks/create', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'INSERT INTO mappacks (ID, name, levels, stars, coins, difficulty, rgbcolors) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const { packName, levels, difficulty, stars, coins, color } = req.body;
    // console.log(ID, packName, levels, difficulty, stars, coins, color);
    const userName = req.cookies.username;
    try {
        await db.execute(query, [null, packName, levels, stars, coins, difficulty, color]);
        console_api_1.default.Log("main", `Panel action: created mappack ${packName}. Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: mappack creation error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
router.post('/mappacks/edit', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'UPDATE mappacks SET name = ?, levels = ?, stars = ?, coins = ?, difficulty = ?, rgbcolors = ? WHERE ID = ?';
    const { ID, packName, levels, difficulty, stars, coins, color } = req.body;
    // console.log(ID, packName, levels, difficulty, stars, coins, color);
    const userName = req.cookies.username;
    try {
        await db.execute(query, [packName, levels, stars, coins, difficulty, color, ID]);
        console_api_1.default.Log("main", `Panel action: edited mappack ${packName} (${ID}). Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: mappack editing error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
router.post('/mappacks/delete', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const ID = parseInt(req.body.ID);
    const packName = req.body.packName;
    const userName = req.body.userName;
    const query = 'DELETE FROM mappacks WHERE ID = ?';
    try {
        const [result] = await db.execute(query, [ID]);
        if (result.affectedRows > 0) {
            console_api_1.default.Log("main", `Panel action: deleted mappack ${packName} (${ID}). Executed by: ${userName}`);
            res.status(200).send("1");
            return;
        }
        else {
            console_api_1.default.Warn("main", `Panel action: can not delete mappack ${packName} (${ID}): Not Found. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
            res.status(200).send("-1");
            return;
        }
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: mappack deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
router.post('/gauntlets/create', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'INSERT INTO gauntlets (ID, level1, level2, level3, level4, level5) VALUES (?, ?, ?, ?, ?, ?)';
    const { ID, level1, level2, level3, level4, level5 } = req.body;
    const gauntletName = ["Fire", "Ice", "Poison", "Shadow", "Lava", "Bonus", "Demon", "Time", "Crystal", "Magic", "Spike", "Monster", "Doom", "Death", "Forest", "Rune", "Force", "Spooky", "Dragon", "Water", "Haunted", "Acid", "Witch", "Power", "Potion", "Snake", "Toxic", "Halloween", "Treasure", "Ghost", "Spider", "Gem", "Inferno", "Portal", "Strange", "Fantasy", "Christmas", "Surprise", "Mystery", "Cursed", "Cyborg", "Castle", "Grave", "Temple", "World", "Galaxy", "Universe", "Discord", "Split", "NCS I", "NCS II", "Unknown 1", "Unknown 2", "Unknown 3", "Unknown 4", "Unknown 5"];
    // console.log(ID, packName, levels, difficulty, stars, coins, color);
    const userName = req.cookies.username;
    const gauntletParsedName = gauntletName[parseInt(ID) - 1];
    try {
        await db.execute(query, [ID, level1, level2, level3, level4, level5]);
        console_api_1.default.Log("main", `Panel action: created gauntlet ${gauntletParsedName}. Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: gauntlet creation error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
router.post('/gauntlets/edit', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'UPDATE gauntlets SET level1 = ?, level2 = ?, level3 = ?, level4 = ?, level5 = ? WHERE ID = ?';
    const gauntletName = ["Fire", "Ice", "Poison", "Shadow", "Lava", "Bonus", "Demon", "Time", "Crystal", "Magic", "Spike", "Monster", "Doom", "Death", "Forest", "Rune", "Force", "Spooky", "Dragon", "Water", "Haunted", "Acid", "Witch", "Power", "Potion", "Snake", "Toxic", "Halloween", "Treasure", "Ghost", "Spider", "Gem", "Inferno", "Portal", "Strange", "Fantasy", "Christmas", "Surprise", "Mystery", "Cursed", "Cyborg", "Castle", "Grave", "Temple", "World", "Galaxy", "Universe", "Discord", "Split", "NCS I", "NCS II", "Unknown 1", "Unknown 2", "Unknown 3", "Unknown 4", "Unknown 5"];
    const { ID, level1, level2, level3, level4, level5 } = req.body;
    const gauntletParsedName = gauntletName[parseInt(ID) - 1];
    const userName = req.cookies.username;
    try {
        await db.execute(query, [level1, level2, level3, level4, level5, ID]);
        console_api_1.default.Log("main", `Panel action: edited gauntlet ${gauntletParsedName} (${ID}). Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: mappack deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
router.post('/gauntlets/delete', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const ID = parseInt(req.body.ID);
    const packName = req.body.packName;
    const userName = req.body.userName;
    const query = 'DELETE FROM gauntlets WHERE ID = ?';
    try {
        const [result] = await db.execute(query, [ID]);
        if (result.affectedRows > 0) {
            console_api_1.default.Log("main", `Panel action: deleted gauntlet ${packName} (${ID}). Executed by: ${userName}`);
            res.status(200).send("1");
            return;
        }
        else {
            console_api_1.default.Warn("main", `Panel action: can not delete gauntlet ${packName} (${ID}): Not Found. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
            res.status(200).send("-1");
            return;
        }
    }
    catch (e) {
        console_api_1.default.Error("main", `Panel action: gauntlet deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});
exports.default = router;
