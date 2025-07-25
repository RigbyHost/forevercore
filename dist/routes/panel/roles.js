'package net.fimastgd.forevercore.routes.panel.roles';
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
const console_api_1 = __importDefault(require("../../modules/console-api"));
const roles_1 = require("../../panel/roles/roles");
const numbers_1 = require("../../modules/numbers");
const db = require("../../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
const roles = new roles_1.Roles();
const is = new numbers_1.Numbers();
router.get('/', async (req, res) => {
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
    console_api_1.default.Log("Query thread", `Handled new session '/panel/roles', opened by ${req.cookies.username}`);
    const allRoles = await roles.getAllRoles();
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, username: req.cookies.username.toString(), roles: allRoles };
    // ConsoleApi.Debug('Render thread', JSON.stringify(data, null, 2));
    console_api_1.default.Log("Render thread", `Rendered page '/panel/roles'`);
    res.render("panel/roles/index", data);
    return;
});
router.post('/', async (req, res) => {
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
    const allRoles = await roles.getAllRoles();
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, username: req.cookies.username.toString(), roles: allRoles };
    // ConsoleApi.Debug('Render thread', JSON.stringify(data, null, 2));
    res.render("panel/roles/role-select", data);
    return;
});
router.get('/create', async (req, res) => {
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
    console_api_1.default.Log("Query thread", `Handled new session '/panel/roles/create', opened by ${req.cookies.username}`);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, username: req.cookies.username.toString() };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/roles/create'`);
    res.render("panel/roles/create", data);
    return;
});
router.get('/edit/:id', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    let roleID = req.params.id;
    console_api_1.default.Log("Query thread", `Handled new session '/panel/roles/edit/${roleID}', opened by ${req.cookies.username}`);
    if (!is.Int(roleID) && !is.Positive(roleID)) {
        console_api_1.default.Warn("main", `Unknown roleId "${roleID}". Executed by: ${req.cookies.username}`);
        roleID = 0;
    }
    else {
        roleID = parseInt(roleID, 10);
    }
    const getRoleById = await roles.getRoleById(req.cookies.username.toString(), roleID);
    // console.log(getRoleById);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, username: req.cookies.username.toString(), roles: getRoleById, rid: parseInt(roleID, 10) };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/roles/edit/${roleID}'`);
    res.status(200).render('panel/roles/edit', data);
    return;
});
router.post('/create', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
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
router.post('/edit', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
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
router.post('/handrole', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    const { rid, properties, actions, commands } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).send("-3");
        return;
    }
    let prohodka = false;
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
        const handrole = await roles.setRole(req.body.target.toString(), req.body.roleID);
        res.status(200).send(handrole ? "1" : "-1");
        return;
    }
    else if (prohodka == "unset") {
        const handrole = await roles.unsetRole(req.body.target.toString(), req.body.roleID);
        res.status(200).send(handrole ? "1" : "-1");
        return;
    }
    else {
        res.status(200).send("-1");
        return;
    }
});
router.post('/delete', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    const { roleID } = req.body;
    if (!req.cookies.username || adminPanel == 0) {
        res.status(200).json({ status: -3, message: "Not authorized" });
        return;
    }
    const deleteRole = await roles.deleteRole(req.cookies.username.toString(), roleID);
    res.status(200).send(deleteRole ? "1" : "-1");
});
exports.default = router;
