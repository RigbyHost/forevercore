'package net.fimastgd.forevercore.routes.panel.main';

const express = require('express');
const cookieParser = require("cookie-parser");
const router = express.Router();
const settings = require("../../serverconf/settings");
const Panel = require("../../panel/main");
const musicState = require("../../serverconf/music");
const getRoleInfo = require("../../panel/accounts/getRoleInfo.ts").default;

const ConsoleApi = require("../../modules/console-api");

router.use(cookieParser());

router.get('/', async (req, res) => {
	if (!req.cookies.username || req.cookies.username == "") {
		if (settings.GDPSID != "") {
			res.redirect(`${settings.GDPSID}/panel/accounts/login`);
		} else {
			res.redirect(`/panel/accounts/login`);
		}
		return;
	} 
	ConsoleApi.Log("Query thread", `Handled new session '/panel', opened by ${req.cookies.username}`);
	const zemuAvailable = musicState.zemu ? 1 : 0;
	const accountID = await Panel.account("getID", req.cookies.username);
	// const acc = JSON.stringify(accountID, null, 2);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(parseInt(accountID));
	const data = {
		GDPS: settings.serverName,
		username: req.cookies.username,
		accountID: accountID, 
		GDPSID: settings.GDPSID,
		zemuAvailable: zemuAvailable, 
		roleName: roleName, 
		advancedPanel: advancedPanel, 
		adminPanel: adminPanel
	};
	ConsoleApi.Log("Render thread", `Rendered page '/panel'`);
	res.render('panel/index', data);
	return;
});

// POST

module.exports = router;