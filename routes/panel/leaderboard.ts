'package net.fimastgd.forevercore.routes.panel.leaderboard';

import express from 'express';
import cookieParser from 'cookie-parser';
import settings from '../../serverconf/settings';
import banUser from '../../panel/leaderboard/ban';
import unbanUser from '../../panel/leaderboard/unban';
import Panel from '../../panel/main';
import getRoleInfo from '../../panel/accounts/getRoleInfo';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ConsoleApi from '../../modules/console-api';
 
const db: Connection = require("../../serverconf/db");
const GDPSID: string = settings.GDPSID.toString();

const router = express.Router();
router.use(cookieParser());

type int = number;


router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('errors/404');
});

router.get('/ban', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
			// я гений, исправлять лень
        } else {
            if (settings.GDPSID != "") {
				res.redirect(`${settings.GDPSID}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
            return;
        } 
    }
    ConsoleApi.Log("Query thread", `Handled new session '/panel/leaderboard/ban', opened by ${req.cookies.username}`);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/leaderboard/ban'`);
    res.render("panel/leaderboard/ban", data);
    return; 
});

// POST
router.post('/ban', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
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
    
    const result = await banUser(req.body.userName);
    res.status(200).send(result.toString());
    return;
});

router.post('/unban', async (req: express.Request, res: express.Response) => {
    const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
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
    
    const result = await unbanUser(req.body.userName);
    res.status(200).send(result.toString());
    return;
});

export default router; 
