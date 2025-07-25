'package net.fimastgd.forevercore.routes.panel.leaderboard';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const settings_1 = require("../../serverconf/settings");
const ban_1 = __importDefault(require("../../panel/leaderboard/ban"));
const unban_1 = __importDefault(require("../../panel/leaderboard/unban"));
const main_1 = __importDefault(require("../../panel/main"));
const getRoleInfo_1 = __importDefault(require("../../panel/accounts/getRoleInfo"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const db = require("../../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
router.get('/', async (req, res) => {
    res.render('errors/404');
});
router.get('/ban', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await (0, getRoleInfo_1.default)(accountID);
    if (!req.cookies.username || advancedPanel == 0) {
        if (adminPanel != 0) {
            // я гений, исправлять лень
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
    console_api_1.default.Log("Query thread", `Handled new session '/panel/leaderboard/ban', opened by ${req.cookies.username}`);
    const data = { GDPS: settings_1.settings.serverName, GDPSID: settings_1.settings.GDPSID };
    console_api_1.default.Log("Render thread", `Rendered page '/panel/leaderboard/ban'`);
    res.render("panel/leaderboard/ban", data);
    return;
});
// POST
router.post('/ban', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await (0, getRoleInfo_1.default)(accountID);
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
    const result = await (0, ban_1.default)(req.body.userName);
    res.status(200).send(result.toString());
    return;
});
router.post('/unban', async (req, res) => {
    const accountID = await main_1.default.account("getID", req.cookies.username);
    const { roleName, advancedPanel, adminPanel } = await (0, getRoleInfo_1.default)(accountID);
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
    const result = await (0, unban_1.default)(req.body.userName);
    res.status(200).send(result.toString());
    return;
});
exports.default = router;
