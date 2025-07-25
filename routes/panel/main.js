'package net.fimastgd.forevercore.routes.panel.main';

const express = require('express');
const cookieParser = require("cookie-parser");
const router = express.Router({ mergeParams: true });
const { getSettings } = require("../../serverconf/settings");
const Panel = require("../../panel/main").default;
const { getMusicState } = require("../../serverconf/music");
const getRoleInfo = require("../../panel/accounts/getRoleInfo").default;

const ConsoleApi = require("../../modules/console-api").default;

router.use(cookieParser());

router.get('/', async (req, res) => {
	// ConsoleApi.Debug("Render thread", req.params.gdpsid)
	const gdpsid = req.params.gdpsid.toString();
	if (!req.cookies[gdpsid + "-username"] || req.cookies[gdpsid + "-username"] == "") {
		if (gdpsid != "") {
			res.redirect(`/${gdpsid}/panel/accounts/login`);
		} else {
			res.redirect(`/panel/accounts/login`);
		}
		return;
	} 
	ConsoleApi.Log("Query thread", `Handled new session '/panel', opened by ${req.cookies[gdpsid + "-username"]}`);
	const zemuAvailable = getMusicState(gdpsid).zemu ? 1 : 0;
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	// const acc = JSON.stringify(accountID, null, 2);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(gdpsid, parseInt(accountID));
	const data = {
		GDPS: getSettings(gdpsid).serverName,
		username: req.cookies[gdpsid + "-username"],
		accountID: accountID, 
		GDPSID: gdpsid,
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