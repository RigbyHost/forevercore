"package net.fimastgd.forevercore.routes.panel.roles";

import express from "express";
import cookieParser from "cookie-parser";
import Panel from "../../panel/main";
import getRoleInfo from "../../panel/accounts/getRoleInfo";
import ConsoleApi from "../../modules/console-api";
import { Roles } from "../../panel/roles/roles";
import { Numbers } from "number-utils-all";

const router = express.Router({ mergeParams: true });
router.use(cookieParser());

type int = number;

const roles = new Roles();
const is = new Numbers();

// общая функция проверки прав администратора
const checkAdminPermissions = async (req: express.Request, res: express.Response) => {
	const gdpsid = req.params.gdpsid.toString();
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
		username,
		gdpsid
	};
};

// GET /roles - получить список всех ролей
router.get("/", async (req: express.Request, res: express.Response) => {
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	try {
		ConsoleApi.Log("API Request", `${permission.gdpsid}* GET /panel/roles by ${permission.username}`);
		const allRoles = await roles.getAllRoles(permission.gdpsid);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Roles retrieved successfully",
			data: allRoles
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${permission.gdpsid}* Failed to get roles: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to retrieve roles"
		});
	}
});

// POST /roles/create - создать новую роль
router.post("/create", async (req: express.Request, res: express.Response) => {
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const { properties, actions, commands } = req.body;

	try {
		ConsoleApi.Log("API Request", `${permission.gdpsid}* POST /panel/roles/create by ${permission.username}`);
		const createResult = await roles.createRole(permission.gdpsid, permission.username, properties, actions, commands);

		// Обработка результата создания роли
		if (createResult.status === 1) {
			res.status(200).json({
				status: "success",
				code: 1,
				server_status: 200,
				message: "Role created successfully"
			});
		} else {
			res.status(200).json({
				status: "error",
				code: createResult.status,
				server_status: 200,
				message: createResult.message
			});
		}
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${permission.gdpsid}* Failed to create role: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to create role"
		});
	}
});

// POST /roles/edit - редактировать существующую роль
router.post("/edit", async (req: express.Request, res: express.Response) => {
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const { rid, properties, actions, commands } = req.body;

	try {
		ConsoleApi.Log("API Request", `${permission.gdpsid}* POST /panel/roles/edit by ${permission.username} for role ${rid}`);
		const editResult = await roles.editRole(permission.gdpsid, permission.username, rid, properties, actions, commands);

		// обработка результата редактирования роли
		if (editResult.status === 1) {
			res.status(200).json({
				status: "success",
				code: 1,
				server_status: 200,
				message: "Role updated successfully"
			});
		} else {
			res.status(200).json({
				status: "error",
				code: editResult.status,
				server_status: 200,
				message: editResult.message
			});
		}
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${permission.gdpsid}* Failed to edit role ${rid}: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to update role"
		});
	}
});

// POST /roles/handrole - назначить/снять роль с пользователя
router.post("/handrole", async (req: express.Request, res: express.Response) => {
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const { action, target, roleID } = req.body;

	try {
		ConsoleApi.Log("API Request", `${permission.gdpsid}* POST /panel/roles/handrole by ${permission.username} for ${target}`);

		let result = false;
		if (action === 1) {
			result = await roles.setRole(permission.gdpsid, permission.username, roleID);
		} else if (action === 2) {
			result = await roles.unsetRole(permission.gdpsid, permission.username, roleID);
		} else {
			res.status(400).json({
				status: "error",
				code: -2,
				server_status: 400,
				message: "Invalid action"
			});
		}

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Role assignment updated",
			result: result
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${permission.gdpsid}* Failed to handle role for ${target}: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to update role assignment"
		});
	}
});

// POST /roles/delete - удалить роль
router.post("/delete", async (req: express.Request, res: express.Response) => {
	const permission = await checkAdminPermissions(req, res);
	if (!permission.status) res.status(401).json({ ...permission.response });

	const { roleID } = req.body;

	try {
		ConsoleApi.Log("API Request", `${permission.gdpsid}* POST /panel/roles/delete by ${permission.username} for role ${roleID}`);
		const deleteResult = await roles.deleteRole(permission.gdpsid, permission.username, roleID);

		res.status(200).json({
			status: "success",
			code: 1,
			server_status: 200,
			message: "Role deleted successfully",
			result: deleteResult
		});
	} catch (error) {
		ConsoleApi.Error("Panel thread", `${permission.gdpsid}* Failed to delete role ${roleID}: ${error}`);
		res.status(500).json({
			status: "error",
			code: -1,
			server_status: 500,
			message: "Failed to delete role"
		});
	}
});

export default router;
