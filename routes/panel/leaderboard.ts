"package net.fimastgd.forevercore.routes.panel.leaderboard";

import express from "express";
import cookieParser from "cookie-parser";
import { getSettings } from "../../serverconf/settings";
import banUser from "../../panel/leaderboard/ban";
import unbanUser from "../../panel/leaderboard/unban";
import Panel from "../../panel/main";
import getRoleInfo from "../../panel/accounts/getRoleInfo";
import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import ConsoleApi from "../../modules/console-api";

const router = express.Router({ mergeParams: true });
router.use(cookieParser());

type int = number;

router.get("/", async (req: express.Request, res: express.Response) => {
	res.render("errors/404");
});

router.get("/ban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(gdpsid, accountID);
	if (!req.cookies[gdpsid + "-username"] || advancedPanel == 0) {
		if (adminPanel != 0) {
			// я гений, исправлять лень
			// TODO: исправить
		} else {
			if (gdpsid != "") {
				res.redirect(`${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
	}
	ConsoleApi.Log("Query thread", `Handled new session '/panel/leaderboard/ban', opened by ${req.cookies[gdpsid + "-username"]}`);
	const data = { GDPS: getSettings(req.params.gdpsid.toString()).serverName, GDPSID: gdpsid };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/leaderboard/ban'`);
	res.render("panel/leaderboard/ban", data);
	return;
});

// POST
router.post("/ban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(gdpsid, accountID);
	if (!req.cookies[gdpsid + "-username"] || advancedPanel == 0) {
		if (adminPanel != 0) {
		} else {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
	}

	const result = await banUser(gdpsid, req.body.userName);
	res.status(200).send(result.toString());
	return;
});

router.post("/unban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(gdpsid, accountID);
	if (!req.cookies[gdpsid + "-username"] || advancedPanel == 0) {
		if (adminPanel != 0) {
		} else {
			if (gdpsid != "") {
				res.redirect(`/${gdpsid}/panel/accounts/login`);
			} else {
				res.redirect(`/panel/accounts/login`);
			}
			return;
		}
	}

	const result = await unbanUser(gdpsid, req.body.userName);
	res.status(200).send(result.toString());
	return;
});

export default router;
