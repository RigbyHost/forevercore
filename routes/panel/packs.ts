'package net.fimastgd.forevercore.routes.panel.packs';

import express from 'express';
import cookieParser from 'cookie-parser';
import settings from '../../serverconf/settings';
import Panel from '../../panel/main';
const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;
import { Connection, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
import getMapPacks from '../../panel/packs/mappacks';
import ConsoleApi from '../../modules/console-api';
import { getGauntlets } from '../../panel/packs/gauntlets';

const db: Connection = require("../../serverconf/db");
const GDPSID: string = settings.GDPSID.toString();

const router = express.Router();
router.use(cookieParser());

type int = number;
type ustring = string | undefined;
type uint = number | string | undefined;

interface GetData {
    GDPS: string,
    GDPSID: string | number,
    data: any,
    username: string,
    packData: (string | undefined | number)[] | undefined
}
interface MappackData {
    packName: string | undefined,
    levels: string | undefined,
    stars: number | undefined,
    coins: number | undefined,
    difficulty: number | undefined,
    rgbcolors: string | undefined
}
interface GauntletData {
    ID: number | undefined,
    level1: (number | string | undefined),
    level2: number | undefined,
    level3: number | undefined,
    level4: number | undefined,
    level5: number | undefined
}

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('errors/404');
});

router.get('/mappacks', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
	ConsoleApi.Log("Query thread", `Handled new session '/panel/packs/mappacks', opened by ${req.cookies.username}`);
    const mapPacks = await getMapPacks();
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: mapPacks, username: req.cookies.username.toString(), packData: undefined };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/mappacks'`);
    res.render("panel/packs/mappacks", data);
    return;
});

// редактор мап паков
router.get('/mappacks/edit/:id', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
	ConsoleApi.Log("Query thread", `Handled new session '/panel/packs/mappacks/edit/${req.params.id}', opened by ${req.cookies.username}`);
    const packID = req.params.id;
    const mappackData: MappackData = await Panel.getMappackData(packID);
    
    const map: ustring[] = [
        mappackData.packName,
        mappackData.levels,
        (mappackData.stars == undefined) ? undefined : mappackData.stars.toString(),
        (mappackData.coins == undefined) ? undefined : mappackData.coins.toString(),
        (mappackData.difficulty == undefined) ? undefined : mappackData.difficulty.toString(),
        mappackData.rgbcolors,
        packID
    ];
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: map };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/mappacks/edit/${packID}'`);
    res.render("panel/packs/mappacks-edit", data);
    return;
});
router.get('/mappacks/create', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
	ConsoleApi.Log("Query thread", `Handled new session '/panel/packs/mappacks/create', opened by ${req.cookies.username}`);
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: undefined };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/mappacks/create'`);
    res.render("panel/packs/mappacks-create", data);
    return;
});

// ГАУНТЛЕТЫ
router.get('/gauntlets', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
	ConsoleApi.Log("Query thread", `Handled new session '/panel/packs/gauntlets', opened by ${req.cookies.username}`);
    const gauntlets = await getGauntlets();
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: gauntlets, username: req.cookies.username.toString(), packData: undefined };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/gauntlets'`);
    res.render("panel/packs/gauntlets", data);
    return;
});

router.get('/gauntlets/create', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }
	ConsoleApi.Log("Query thread", `Handled new session '/panel/packs/gauntlets/create', opened by ${req.cookies.username}`);
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: undefined };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/gauntlets/create'`);
    res.render("panel/packs/gauntlets-create", data);
    return;
});

// редактор гаунтлетов
router.get('/gauntlets/edit/:id', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        if (settings.GDPSID != "") {
            res.redirect(`${settings.GDPSID}/panel/accounts/login`);
        } else {
            res.redirect(`/panel/accounts/login`);
        }
        return;
    }

    const packID = req.params.id;
    ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/gauntlets/edit/${packID}'`);

    const gauntletData = await Panel.getGauntletData(packID);
    
    const map: uint[] = [
        packID,
        gauntletData.level1,
        gauntletData.level2,
        gauntletData.level3,
        gauntletData.level4,
        gauntletData.level5
    ];
    const data: GetData = { GDPS: settings.serverName, GDPSID: settings.GDPSID, data: undefined, username: req.cookies.username.toString(), packData: map };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/packs/gauntlets/edit/${packID}'`);
    res.render("panel/packs/gauntlets-edit", data);
    return;
});

// POST
router.post('/mappacks/create', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
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
        ConsoleApi.Log("main", `Panel action: created mappack ${packName}. Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: mappack creation error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});

router.post('/mappacks/edit', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
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
        ConsoleApi.Log("main", `Panel action: edited mappack ${packName} (${ID}). Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: mappack editing error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});

router.post('/mappacks/delete', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }

    const ID: int = parseInt(req.body.ID);
    const packName: string = req.body.packName;
    const userName: string = req.body.userName;

    const query = 'DELETE FROM mappacks WHERE ID = ?';

    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(query, [ID]);
        if (result.affectedRows > 0) {
            ConsoleApi.Log("main", `Panel action: deleted mappack ${packName} (${ID}). Executed by: ${userName}`);
            res.status(200).send("1");
            return;
        } else {
            ConsoleApi.Warn("main", `Panel action: can not delete mappack ${packName} (${ID}): Not Found. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
            res.status(200).send("-1");
            return;
        }
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: mappack deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});

router.post('/gauntlets/create', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'INSERT INTO gauntlets (ID, level1, level2, level3, level4, level5) VALUES (?, ?, ?, ?, ?, ?)';

    const { ID, level1, level2, level3, level4, level5 } = req.body;
    const gauntletName: string[] = [ "Fire","Ice","Poison","Shadow","Lava","Bonus","Demon","Time","Crystal","Magic","Spike","Monster","Doom","Death","Forest","Rune","Force","Spooky","Dragon","Water","Haunted","Acid","Witch","Power","Potion","Snake","Toxic","Halloween","Treasure","Ghost","Spider","Gem","Inferno","Portal","Strange","Fantasy","Christmas","Surprise","Mystery","Cursed","Cyborg","Castle","Grave","Temple","World","Galaxy","Universe","Discord","Split","NCS I","NCS II","Unknown 1","Unknown 2","Unknown 3","Unknown 4","Unknown 5" ];
    // console.log(ID, packName, levels, difficulty, stars, coins, color);
    const userName = req.cookies.username;
    const gauntletParsedName = gauntletName[parseInt(ID) - 1];

    try {
        await db.execute(query, [ID, level1, level2, level3, level4, level5]);
        ConsoleApi.Log("main", `Panel action: created gauntlet ${gauntletParsedName}. Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: gauntlet creation error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});

router.post('/gauntlets/edit', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }
    const query = 'UPDATE gauntlets SET level1 = ?, level2 = ?, level3 = ?, level4 = ?, level5 = ? WHERE ID = ?';

    const gauntletName: string[] = [ "Fire","Ice","Poison","Shadow","Lava","Bonus","Demon","Time","Crystal","Magic","Spike","Monster","Doom","Death","Forest","Rune","Force","Spooky","Dragon","Water","Haunted","Acid","Witch","Power","Potion","Snake","Toxic","Halloween","Treasure","Ghost","Spider","Gem","Inferno","Portal","Strange","Fantasy","Christmas","Surprise","Mystery","Cursed","Cyborg","Castle","Grave","Temple","World","Galaxy","Universe","Discord","Split","NCS I","NCS II","Unknown 1","Unknown 2","Unknown 3","Unknown 4","Unknown 5" ];

    const { ID, level1, level2, level3, level4, level5 } = req.body;
    const gauntletParsedName = gauntletName[parseInt(ID) - 1];

    const userName = req.cookies.username;

    try {
        await db.execute(query, [level1, level2, level3, level4, level5, ID]);
        ConsoleApi.Log("main", `Panel action: edited gauntlet ${gauntletParsedName} (${ID}). Executed by: ${userName}`);
        res.status(200).send("1");
        return;
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: mappack deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});


router.post('/gauntlets/delete', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        res.send("-1");
        return;
    }

    const ID: int = parseInt(req.body.ID);
    const packName: string = req.body.packName;
    const userName: string = req.body.userName;

    const query = 'DELETE FROM gauntlets WHERE ID = ?';

    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(query, [ID]);
        if (result.affectedRows > 0) {
            ConsoleApi.Log("main", `Panel action: deleted gauntlet ${packName} (${ID}). Executed by: ${userName}`);
            res.status(200).send("1");
            return;
        } else {
            ConsoleApi.Warn("main", `Panel action: can not delete gauntlet ${packName} (${ID}): Not Found. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
            res.status(200).send("-1");
            return;
        }
    } catch (e) {
        ConsoleApi.Error("main", `Panel action: gauntlet deletion error: ${e}. Executed by: ${userName} at net.fimastgd.forevercore.routes.panel.packs`);
        res.status(200).send("-1");
        return;
    }
});

export default router; 
