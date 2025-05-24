'package net.fimastgd.forevercore.routes.panel.lists';

import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import { settings } from '../../serverconf/settings';
import Panel from '../../panel/main';
import ListLib from '../../panel/lists/listLib';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ConsoleApi from '../../modules/console-api';

const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;
const db: Connection = require("../../serverconf/db");
const GDPSID: string = settings.GDPSID.toString();

const router = express.Router();
router.use(cookieParser());

type int = number; // -inf ... +inf

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('errors/404');
});

router.get('/reports', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID); 
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    ConsoleApi.Log("Query thread", `Handled new session '/panel/lists/reports', opened by ${req.cookies.username}`);
    const table = await ListLib.getReportList();
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, rows: table };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/lists/reports'`);
    res.render("panel/lists/reports", data);
    return; 
});

router.get('/suggests', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    ConsoleApi.Log("Query thread", `Handled new session '/panel/lists/suggests', opened by ${req.cookies.username}`);
    const offset: int = 0;
    const page: int = 0;
    const table = await ListLib.getSuggestList(offset);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, suggestions: table, page: page };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/lists/suggests'`);
    res.render("panel/lists/suggests", data);
    return; 
});

router.get('/suggests/:offset', async (req: express.Request, res: express.Response) => {
   const accountID = await Panel.account("getID", req.cookies.username);
   const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
   if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    let offset: int;
    const offsetParam = req.params.offset;
    const offsetSplit = offsetParam ? offsetParam.split(".") : [];
   
    try {
        if (offsetSplit[0] === "offset") {
            offset = parseInt(offsetSplit[1], 10);
        } else {
            offset = 0;
        }
    } catch {
        offset = 0;
    }

    const table = await ListLib.getSuggestList(offset);
    const page: int = parseInt(offsetSplit[1], 10);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, suggestions: table, page: page };
    res.render("panel/lists/suggests", data);
    return;
});

router.get('/unlisted', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    ConsoleApi.Log("Query thread", `Handled new session '/panel/lists/unlisted', opened by ${req.cookies.username}`);
    const offset: int = 0;
    const page: int = 0;
    const table = await ListLib.getUnlistedList(offset);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, rows: table, page: page };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/lists/unlisted'`);
    res.render("panel/lists/unlisted", data);
    return; 
});

router.get('/unlisted/:offset', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    
    let offset: int;
    
    const offsetParam = req.params.offset;
    const offsetSplit = offsetParam ? offsetParam.split(".") : [];
    
    try {
        if (offsetSplit[0] === "offset") {
            offset = parseInt(offsetSplit[1], 10);
        } else {
            offset = 0;
        }
    } catch {
        offset = 0;
    }

    const table = await ListLib.getUnlistedList(offset);
    const page: int = parseInt(offsetSplit[1], 10);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, rows: table, page: page };
    res.render("panel/lists/unlisted", data);
    return;
});

// POST


export default router; 
