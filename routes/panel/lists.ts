`package net.fimastgd.forevercore.routes.panel.lists`;

import express from "express";
import cookieParser from "cookie-parser";
import { getSettings } from "../../serverconf/settings";
import Panel from "../../panel/main";
import ListLib from "../../panel/lists/listLib";
import ConsoleApi from "../../modules/console-api";
import getRoleInfo from "../../panel/accounts/getRoleInfo";

const router = express.Router({ mergeParams: true });
router.use(cookieParser());

type int = number;

const checkListPermissions = async (req: express.Request, res: express.Response) => {
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

router.get("/", async (req: express.Request, res: express.Response) => {
	res.status(404).json({
		status: "error",
		code: -404,
		server_status: 404,
		message: "Not found"
	});
});

router.get("/api/reports", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/lists/api/reports by ${username}`);
	
	// check permissions
	const hasPermission = await checkListPermissions(req, res);
	if (!hasPermission) return;

	try {
		const table = await ListLib.getReportList(gdpsid);

		/*
        Response format:
        - status: "success"
        - data: array of reports
        */
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Reports retrieved successfully",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Reports error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve reports"
		});
	}
});

router.get("/api/suggests", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/lists/api/suggests by ${username}`);
	
	// check permissions
	const hasPermission = await checkListPermissions(req, res);
	if (!hasPermission) return;

	try {
		const offset = 0;
		const table = await ListLib.getSuggestList(gdpsid, offset);

		/*
        Response format:
        - status: "success"
        - data: array of suggestions
        */
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Suggestions retrieved successfully",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Suggestions error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve suggestions"
		});
	}
});

router.get("/api/suggests/:offset", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/lists/api/suggests/${req.params.offset} by ${username}`);
	
	// check permissions
	const hasPermission = await checkListPermissions(req, res);
	if (!hasPermission) return;

	try {
		let offset: number;
		const offsetParam = req.params.offset;
		const offsetSplit = offsetParam ? offsetParam.split(".") : [];

		if (offsetSplit[0] === "offset") {
			offset = parseInt(offsetSplit[1], 10);
		} else {
			offset = 0;
		}

		const table = await ListLib.getSuggestList(gdpsid, offset);

		/*
        Response format:
        - status: "success"
        - data: array of paginated suggestions
        */
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Paginated suggestions retrieved successfully",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Paginated suggestions error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve paginated suggestions"
		});
	}
});

router.get("/api/unlisted", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/lists/api/unlisted by ${username}`);
	
	// check permissions
	const hasPermission = await checkListPermissions(req, res);
	if (!hasPermission) return;

	try {
		const offset = 0;
		const table = await ListLib.getUnlistedList(gdpsid, offset);

		/*
        Response format:
        - status: "success"
        - data: array of unlisted levels
        */
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Unlisted levels retrieved successfully",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Unlisted levels error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve unlisted levels"
		});
	}
});

router.get("/api/unlisted/:offset", async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"] || "anonymous";
	ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/lists/api/unlisted/${req.params.offset} by ${username}`);
	
	// check permissions
	const hasPermission = await checkListPermissions(req, res);
	if (!hasPermission) return;

	try {
		ConsoleApi.Log("Query thread", `${gdpsid}* API request '/panel/lists/unlisted' by ${username}`);
		let offset: number;
		const offsetParam = req.params.offset;
		const offsetSplit = offsetParam ? offsetParam.split(".") : [];

		if (offsetSplit[0] === "offset") {
			offset = parseInt(offsetSplit[1], 10);
		} else {
			offset = 0;
		}

		const table = await ListLib.getUnlistedList(gdpsid, offset);

		/*
        Response format:
        - status: "success"
        - data: array of paginated unlisted levels
        */
		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Paginated unlisted levels retrieved successfully",
			data: table
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Paginated unlisted error: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve paginated unlisted levels"
		});
	}
});

export default router;