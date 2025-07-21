'package net.fimastgd.forevercore.routes.panel.lists';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const settings_1 = require("../../serverconf/settings");
const main_1 = __importDefault(require("../../panel/main"));
const listLib_1 = __importDefault(require("../../panel/lists/listLib"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;
const db = require("../../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.get('/', async (req, res) => {
    res.render('errors/404');
});
router.get('/reports', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
        }
        else {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/lists/reports', opened by ${req.cookies.username}`);
    const table = await listLib_1.default.getReportList();
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, rows: table };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/lists/reports'`);
    res.render("panel/lists/reports", data);
    return;
});
router.get('/suggests', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
        }
        else {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/lists/suggests', opened by ${req.cookies.username}`);
    const offset = 0;
    const page = 0;
    const table = await listLib_1.default.getSuggestList(offset);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, suggestions: table, page: page };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/lists/suggests'`);
    res.render("panel/lists/suggests", data);
    return;
});
router.get('/suggests/:offset', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
        }
        else {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
    }
    let offset;
    const offsetParam = req.params.offset;
    const offsetSplit = offsetParam ? offsetParam.split(".") : [];
    try {
        if (offsetSplit[0] === "offset") {
            offset = parseInt(offsetSplit[1], 10);
        }
        else {
            offset = 0;
        }
    }
    catch {
        offset = 0;
    }
    const table = await listLib_1.default.getSuggestList(offset);
    const page = parseInt(offsetSplit[1], 10);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, suggestions: table, page: page };
    res.render("panel/lists/suggests", data);
    return;
});
router.get('/unlisted', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
        }
        else {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
    }
    console_api_1.default.Log("Query thread", `Handled new session '/panel/lists/unlisted', opened by ${req.cookies.username}`);
    const offset = 0;
    const page = 0;
    const table = await listLib_1.default.getUnlistedList(offset);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, rows: table, page: page };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/lists/unlisted'`);
    res.render("panel/lists/unlisted", data);
    return;
});
router.get('/unlisted/:offset', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await getRoleInfo(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
        }
        else {
            if (settings_1.settings.GDPSID != "") {
                res.redirect(`${settings_1.settings.GDPSID}/panel/accounts/login`);
            }
            else {
                res.redirect(`/panel/accounts/login`);
            }
            return;
        }
    }
    let offset;
    const offsetParam = req.params.offset;
    const offsetSplit = offsetParam ? offsetParam.split(".") : [];
    try {
        if (offsetSplit[0] === "offset") {
            offset = parseInt(offsetSplit[1], 10);
        }
        else {
            offset = 0;
        }
    }
    catch {
        offset = 0;
    }
    const table = await listLib_1.default.getUnlistedList(offset);
    const page = parseInt(offsetSplit[1], 10);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID, rows: table, page: page };
    res.render("panel/lists/unlisted", data);
    return;
});
// POST
exports.default = router;
