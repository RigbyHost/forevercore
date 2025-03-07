'package net.fimastgd.forevercore.routes.panel.roles';

import express from 'express';
import cookieParser from 'cookie-parser';
import settings from '../../serverconf/settings';
import Panel from '../../panel/main';
const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;
import { Connection, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
import ConsoleApi from '../../modules/console-api';
import { Roles } from '../../panel/roles/roles';
import { Numbers } from '../../modules/numbers';

const db: Connection = require("../../serverconf/db");
const GDPSID: string = settings.GDPSID.toString();

const router = express.Router();
router.use(cookieParser());

type int = number;

const roles = new Roles();
const is = new Numbers();

router.get('/', async (req: express.Request, res: express.Response) => {
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
    ConsoleApi.Log("Query thread", `Handled new session '/panel/roles', opened by ${req.cookies.username}`);
    const allRoles = await roles.getAllRoles();
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString(), roles: allRoles };
    // ConsoleApi.Debug('Render thread', JSON.stringify(data, null, 2));
    ConsoleApi.Log("Render thread", `Rendered page '/panel/roles'`);
    res.render("panel/roles/index", data);
    return;
}); 

router.post('/', async (req: express.Request, res: express.Response) => {
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
    
    const allRoles = await roles.getAllRoles();
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString(), roles: allRoles };
    // ConsoleApi.Debug('Render thread', JSON.stringify(data, null, 2));
    res.render("panel/roles/role-select", data);
    return;
}); 

router.get('/create', async (req: express.Request, res: express.Response) => {
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
    ConsoleApi.Log("Query thread", `Handled new session '/panel/roles/create', opened by ${req.cookies.username}`);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString() };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/roles/create'`);
    res.render("panel/roles/create", data);
    return;
});

router.get('/edit/:id', async (req: express.Request, res: express.Response) => {
	const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    let roleID: any = req.params.id;
    ConsoleApi.Log("Query thread", `Handled new session '/panel/roles/edit/${roleID}', opened by ${req.cookies.username}`);
    if (!is.Int(roleID) && !is.Positive(roleID)) {
        ConsoleApi.Warn("main", `Unknown roleId "${roleID}". Executed by: ${req.cookies.username}`);
        roleID = 0;
    } else {
        roleID = parseInt(roleID, 10);
    }
    const getRoleById = await roles.getRoleById(req.cookies.username.toString(), roleID);
    // console.log(getRoleById);
    const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString(), roles: getRoleById, rid: parseInt(roleID, 10) };
    ConsoleApi.Log("Render thread", `Rendered page '/panel/roles/edit/${roleID}'`);
    res.status(200).render('panel/roles/edit', data);
    return;
});

router.post('/create', async (req: express.Request, res: express.Response) => {
	const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    const { rid, properties, actions, commands } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    // const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString(), roles: getRoleById, rid: parseInt(roleID, 10) };
    const createRole = await roles.createRole(req.cookies.username.toString(), properties, actions, commands);
    // console.log(JSON.stringify(createRole, null, 2));
    res.json({ createRole });
});

router.post('/edit', async (req: express.Request, res: express.Response) => {
	const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    const { rid, properties, actions, commands } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    // const data = { GDPS: settings.serverName, GDPSID: settings.GDPSID, username: req.cookies.username.toString(), roles: getRoleById, rid: parseInt(roleID, 10) };
    const editrole = await roles.editRole(req.cookies.username.toString(), rid, properties, actions, commands);
    // console.log(JSON.stringify(editrole, null, 2));
    res.json({ editrole });
});
router.post('/handrole', async (req: express.Request, res: express.Response) => {
	const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    const { rid, properties, actions, commands } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).send("-3");
        return;
    }

    let prohodka: boolean | string = false;
    if (await is.Int(req.body.action)) {
        switch (parseInt(req.body.action)) {
            case 1:
                prohodka = "set";
                break;
            case 2:
                prohodka = "unset";
                break;
            default:
                prohodka = false;
                break;
        }
    }

    if (prohodka == "set") {
        const handrole: boolean = await roles.setRole(req.body.target.toString(), req.body.roleID);
        res.status(200).send(handrole ? "1" : "-1");
        return;
    } else if (prohodka == "unset") {
        const handrole: boolean = await roles.unsetRole(req.body.target.toString(), req.body.roleID);
        res.status(200).send(handrole ? "1" : "-1");
        return;
    } else {
        res.status(200).send("-1");
        return;
    }
    
});
router.post('/delete', async (req: express.Request, res: express.Response) => {
	const accountID = await Panel.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
    const { roleID } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    const deleteRole = await roles.deleteRole(req.cookies.username.toString(), roleID);
    res.status(200).send(deleteRole ? "1" : "-1");
});


export default router;  