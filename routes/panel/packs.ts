`package net.fimastgd.forevercore.routes.panel.packs`;

import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { getSettings } from "../../serverconf/settings";
import Panel from "../../panel/main";
import getRoleInfo from "../../panel/accounts/getRoleInfo";
import { RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2/promise";
import getMapPacks from "../../panel/packs/mappacks";
import ConsoleApi from "../../modules/console-api";
import { getGauntlets } from "../../panel/packs/gauntlets";

import threadConnection from "../../serverconf/db";

const router = express.Router({ mergeParams: true });
router.use(cookieParser());

const checkAdminPermissions = async (req: express.Request, res: express.Response) => {
	const gdpsid: string = req.params.gdpsid.toString();
	const username = req.cookies[gdpsid + "-username"];

	if (!username) {
		return {
			status: false,
			response: {
				status: "error",
				code: -1,
				server_status: 401,
				message: "Unauthorized"
			}
		};
	}

	const accountID = await Panel.account(gdpsid, "getID", username);
	const { adminPanel } = await getRoleInfo(gdpsid, accountID);

	if (adminPanel == 0) {
		return {
			status: false,
			response: {
				status: "error",
				code: -3,
				server_status: 403,
				message: "Forbidden: insufficient permissions"
			}
		};
	}

	return {
		status: true,
		username
	};
};

// GET /mappacks
router.get("/mappacks", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/packs/mappacks by ${permission.username}`);
		const mapPacks = await getMapPacks(gdpsid);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Map packs retrieved successfully",
			data: mapPacks
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to get map packs: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve map packs"
		});
	}
});

// GET /gauntlets
router.get("/gauntlets", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	try {
		ConsoleApi.Log("API Request", `${gdpsid}* GET /panel/packs/gauntlets by ${permission.username}`);
		const gauntlets = await getGauntlets(gdpsid);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Gauntlets retrieved successfully",
			data: gauntlets
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to get gauntlets: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve gauntlets"
		});
	}
});

// POST /mappacks/create
router.post("/mappacks/create", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { packName, levels, difficulty, stars, coins, color } = req.body;

	try {
		const query = "INSERT INTO mappacks (ID, name, levels, stars, coins, difficulty, rgbcolors) VALUES (?, ?, ?, ?, ?, ?, ?)";
		await db.execute(query, [null, packName, levels, stars, coins, difficulty, color]);

		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/packs/mappacks/create by ${permission.username}: Created pack '${packName}'`);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Map pack created successfully"
		});
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to create map pack: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to create map pack"
		});
	}
});

// POST /mappacks/edit
router.post("/mappacks/edit", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { ID, packName, levels, difficulty, stars, coins, color } = req.body;

	try {
		const query = "UPDATE mappacks SET name = ?, levels = ?, stars = ?, coins = ?, difficulty = ?, rgbcolors = ? WHERE ID = ?";
		await db.execute(query, [packName, levels, stars, coins, difficulty, color, ID]);

		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/packs/mappacks/edit by ${permission.username}: Edited pack ${ID} '${packName}'`);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Map pack updated successfully"
		});
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to edit map pack: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to update map pack"
		});
	}
});

// POST /mappacks/delete
router.post("/mappacks/delete", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { ID, packName } = req.body;

	try {
		const query = "DELETE FROM mappacks WHERE ID = ?";
		const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(query, [ID]);

		if (result.affectedRows > 0) {
			ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/packs/mappacks/delete by ${permission.username}: Deleted pack ${ID} '${packName}'`);
			res.status(200).json({
				status: "success",
				code: 1,
				server_status: 200,
				message: "Map pack deleted successfully"
			});
		} else {
			ConsoleApi.Warn("Panel thread", `${gdpsid}* Map pack ${ID} not found by ${permission.username}`);
			res.status(404).json({
				status: "error",
				code: -2,
				server_status: 404,
				message: "Map pack not found"
			});
		}
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to delete map pack: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to delete map pack"
		});
	}
});

// POST /gauntlets/create
router.post("/gauntlets/create", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { ID, level1, level2, level3, level4, level5 } = req.body;

	try {
		const query = "INSERT INTO gauntlets (ID, level1, level2, level3, level4, level5) VALUES (?, ?, ?, ?, ?, ?)";
		await db.execute(query, [ID, level1, level2, level3, level4, level5]);

		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/packs/gauntlets/create by ${permission.username}: Created gauntlet ${ID}`);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Gauntlet created successfully"
		});
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to create gauntlet: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to create gauntlet"
		});
	}
});

// POST /gauntlets/edit
router.post("/gauntlets/edit", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { ID, level1, level2, level3, level4, level5 } = req.body;

	try {
		const query = "UPDATE gauntlets SET level1 = ?, level2 = ?, level3 = ?, level4 = ?, level5 = ? WHERE ID = ?";
		await db.execute(query, [level1, level2, level3, level4, level5, ID]);

		ConsoleApi.Log("API Request", `${gdpsid}* POST /panel/packs/gauntlets/edit by ${permission.username}: Edited gauntlet ${ID}`);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Gauntlet updated successfully"
		});
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to edit gauntlet: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to update gauntlet"
		});
	}
});

// POST /gauntlets/delete
router.post("/gauntlets/delete", async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const db = await threadConnection(gdpsid);
	const { ID, packName } = req.body;

	try {
		const query = "DELETE FROM gauntlets WHERE ID = ?";
		const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(query, [ID]);

		if (result.affectedRows > 0) {
			ConsoleApi.Log(
				"API Request",
				`${gdpsid}* POST /panel/packs/gauntlets/delete by ${permission.username}: Deleted gauntlet ${ID} '${packName}'`
			);
			res.status(200).json({
				status: "success",
				code: 1,
				server_status: 200,
				message: "Gauntlet deleted successfully"
			});
		} else {
			ConsoleApi.Warn("Panel thread", `${gdpsid}* Gauntlet ${ID} not found by ${permission.username}`);
			res.status(404).json({
				status: "error",
				code: -2,
				server_status: 404,
				message: "Gauntlet not found"
			});
		}
	} catch (e) {
		ConsoleApi.Error("Panel thread", `${gdpsid}* Failed to delete gauntlet: ${e} by ${permission.username}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to delete gauntlet"
		});
	}
});

export default router;
