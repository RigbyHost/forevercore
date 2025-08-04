`package net.fimastgd.forevercore.routes.panel.leaderboard`;

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

/* will be deleted in next minor
router.get("/ban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	const { roleName, advancedPanel, adminPanel } = await getRoleInfo(gdpsid, accountID);

	const isAuthenticated = !!req.cookies[gdpsid + "-username"];
	const hasAccess = isAuthenticated && (advancedPanel !== 0 || adminPanel !== 0);

	if (!hasAccess) {
		if (gdpsid) {
			return res.redirect(`/${gdpsid}/panel/accounts/login`);
		} else {
			return res.redirect(`/panel/accounts/login`);
		}
	}

	ConsoleApi.Log("Query thread", `Handled new session '/panel/leaderboard/ban', opened by ${req.cookies[gdpsid + "-username"]}`);
	const data = { GDPS: (await getSettings(gdpsid)).serverName, GDPSID: gdpsid };
	ConsoleApi.Log("Render thread", `Rendered page '/panel/leaderboard/ban'`);
	res.render("panel/leaderboard/ban", data);
});
*/

// main function for check permissions
const checkPermissions = async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const accountID = await Panel.account(gdpsid, "getID", req.cookies[gdpsid + "-username"]);
	const { advancedPanel, adminPanel } = await getRoleInfo(gdpsid, accountID);

	const isAuthenticated = !!req.cookies[gdpsid + "-username"];
	const hasAccess = isAuthenticated && (advancedPanel !== 0 || adminPanel !== 0);

	if (!hasAccess) {
		res.status(403).json({
			status: "error",
			code: -3,
			server_status: 403,
			message: "Forbidden: insufficient permissions"
		});
		return false;
	}
	return true;
};

// POST /ban
router.post("/ban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/leaderboard/ban by ${username}`);
	
	// check permissions
	const hasPermission = await checkPermissions(req, res);
	if (!hasPermission) return;

	try {
		const result = await banUser(gdpsid, req.body.userName);

		/*
        Response format:
        - status: "success" | "error"
        - code:
             1 = banned successfully
            -1 = account not found
            -2 = unknown error
        */
		const responseMap: Record<number, { status: string; message: string }> = {
			1: { status: "success", message: "User banned successfully" },
			[-1]: { status: "error", message: "Account not found" },
			[-2]: { status: "error", message: "Unknown error during ban operation" }
		};

		const response = responseMap[result] || {
			status: "error",
			message: "Unexpected result code"
		};

		res.status(200).json({
			status: response.status,
			code: result,
			server_status: 200,
			message: response.message
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread ", `${gdpsid}* Ban error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -2,
			server_status: 500,
			message: "Internal server error"
		});
	}
});

// POST /unban
router.post("/unban", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/leaderboard/unban by ${username}`);
	
	// check permissions
	const hasPermission = await checkPermissions(req, res);
	if (!hasPermission) return;

	try {
		const result = await unbanUser(gdpsid, req.body.userName);

		/*
        Response format:
        - status: "success" | "error"
        - code:
             1 = unbanned successfully
            -1 = account not found
            -2 = unknown error
        */
		const responseMap: Record<number, { status: string; message: string }> = {
			1: { status: "success", message: "User unbanned successfully" },
			[-1]: { status: "error", message: "Account not found" },
			[-2]: { status: "error", message: "Unknown error during unban operation" }
		};

		const response = responseMap[result] || {
			status: "error",
			message: "Unexpected result code"
		};

		res.status(200).json({
			status: response.status,
			code: result,
			server_status: 200,
			message: response.message
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Unban error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -2,
			server_status: 500,
			message: "Internal server error"
		});
	}
});

export default router;