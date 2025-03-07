'package net.fimastgd.forevercore.panel.roles.roles';

type pkg = string;

const getpackage: pkg = "net.fimastgd.forevercore.panel.roles.roles";
import { Connection, RowDataPacket, FieldPacket } from 'mysql2/promise';
const db: Connection = require("../../serverconf/db");
const c = require("ansi-colors");
import ConsoleApi from "../../modules/console-api";
const Panel = require('../main');

interface Properties {
	rolename: string, 
	color: string, 
	badge: number
}
interface Actions {
	diffRatePerm: number, 
	starRatePerm: number, 
	rateDemonPerm: number, 
	featuredRatePerm: number, 
	epicRatePerm: number, 
	legendaryRatePerm: number, 
	mythicRatePerm: number, 
	sendRatePerm: number, 
	panelType: number, 
	reqActivating: number,
	deleteCommentsPerm: number
}
interface Commands {
	CMD_rate: number, 
	CMD_unrate: number, 
	CMD_feature: number, 
	CMD_epic: number, 
	CMD_unepic: number, 
	CMD_verifycoins: number, 
	CMD_daily: number, 
	CMD_weekly: number, 
	CMD_delete: number, 
	CMD_setacc: number, 
	CMD_rename: number, 
	CMD_pass: number, 
	CMD_description: number, 
	CMD_unlist: number, 
	CMD_song: number
}

type UnknownObject = Record<string, undefined>;
type int = number;

interface GetRole {
	properties: Properties | UnknownObject,
	actions: Actions | UnknownObject,
	commands: Commands | UnknownObject
}

interface RoleInsertRow extends RowDataPacket {
	roleID: number;
	accountID: number;
}

interface RoleAssignRow extends RowDataPacket {
	accountID: number;
}

export class Roles {
	private async checkRole(roleName: string): Promise<boolean> {
		const query = 'SELECT COUNT(*) as count FROM roles WHERE roleName = ?';
		const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(query, [roleName]);
		const count = rows[0].count as number;
		return count > 0;
	}

	public async createRole(username: string, properties: Properties, actions: Actions, commands: Commands): Promise<object> {
		const rolename: string = properties.rolename;
		const color: string = properties.color;
		const badge: number = properties.badge
		
		const diffRatePerm: number = actions.diffRatePerm;
		const starRatePerm: number = actions.starRatePerm;
		const rateDemonPerm: number = actions.rateDemonPerm;
		const featuredRatePerm: number = actions.featuredRatePerm;
		const epicRatePerm: number = actions.epicRatePerm;
		const legendaryRatePerm: number = actions.legendaryRatePerm;
		const mythicRatePerm: number = actions.mythicRatePerm;
		const sendRatePerm: number = actions.sendRatePerm;
		const panelType: number = actions.panelType;
		const reqActivating: number = actions.reqActivating; 
		const deleteCommentsPerm: number = actions.deleteCommentsPerm;
		
		const CMD_rate: number = commands.CMD_rate;
		const CMD_unrate: number = commands.CMD_unrate;
		const CMD_feature: number = commands.CMD_feature;
		const CMD_epic: number = commands.CMD_epic;
		const CMD_unepic: number = commands.CMD_unepic;
		const CMD_verifycoins: number = commands.CMD_verifycoins;
		const CMD_daily: number = commands.CMD_daily;
		const CMD_weekly: number = commands.CMD_weekly;
		const CMD_delete: number = commands.CMD_delete;
		const CMD_setacc: number = commands.CMD_setacc;
		const CMD_rename: number = commands.CMD_rename;
		const CMD_pass: number = commands.CMD_pass;
		const CMD_description: number = commands.CMD_description;
		const CMD_unlist: number = commands.CMD_unlist;
		const CMD_song: number = commands.CMD_song;

		let panelProp: number[] = [0, 0];
		if (panelType == 1) {
			panelProp = [0, 0];
		} else if (panelType == 2) {
			panelProp = [1, 0];
		} else if (panelType == 3) {
			panelProp = [0, 1];
		} else {
			panelProp = [0, 0];
		}
		
		const query = `INSERT INTO roles (
			roleName, commandRate, commandUnrate, commandFeature, commandEpic, commandUnepic, commandVerifycoins, commandDaily, commandWeekly, commandDelete, commandSetacc, commandRenameAll, commandDescriptionAll, commandPassAll, commandUnlistAll, commandSongAll,
			actionRateDemon, actionRateStars, actionRateFeature, actionRateEpic, actionRateLegendary, actionRateMythic, actionRequestMod, actionSuggestRating, actionDeleteComment, actionRateDifficulty,
			commentColor, modBadgeLevel, advancedPanel, adminPanel
		) VALUES (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
		)`;
		
		if (!(await this.checkRole(rolename))) {
			try {
				await db.execute(query, [
					rolename, CMD_rate, CMD_unrate, CMD_feature, CMD_epic, CMD_unepic, CMD_verifycoins, CMD_daily, CMD_weekly, CMD_delete, CMD_setacc, CMD_rename, CMD_description, CMD_pass, CMD_unlist, CMD_song,
					rateDemonPerm, starRatePerm, featuredRatePerm, epicRatePerm, legendaryRatePerm, mythicRatePerm, reqActivating, sendRatePerm, deleteCommentsPerm, diffRatePerm,
					color, badge, panelProp[0], panelProp[1]
				]);
				ConsoleApi.Log("main", `Panel action: created role ${rolename}. Executed by: ${username}`);
				return {
					status: 1,
					message: "Role created"
				};
			} catch (error) {
				ConsoleApi.Error("main", `Role creation error: ${error}. Executed by: ${username}`);
				return {
					status: -1,
					message: `${error}`
				};
			}
		} else {
			return {
				status: -2,
				message: `A role with that name already exists`
			};
		}
	}
	public async getRoleById(username: string, roleId: number): Promise<GetRole> {
		const query = `SELECT
			roleName, commandRate, commandUnrate, commandFeature, commandEpic, commandUnepic, commandVerifycoins, commandDaily, commandWeekly, commandDelete, commandSetacc, commandRenameAll, commandDescriptionAll, commandPassAll, commandUnlistAll, commandSongAll,
			actionRateDemon, actionRateStars, actionRateFeature, actionRateEpic, actionRateLegendary, actionRateMythic, actionRequestMod, actionSuggestRating, actionDeleteComment, actionRateDifficulty,
			commentColor, modBadgeLevel, advancedPanel, adminPanel
		FROM roles WHERE roleID = ?`; 
		const propertiesN: UnknownObject = {
			rolename: undefined,
			color: undefined,
			badge: undefined
		};
		const actionsN: UnknownObject = {
			diffRatePerm: undefined,
			starRatePerm: undefined,
			rateDemonPerm: undefined,
			featuredRatePerm: undefined,
			epicRatePerm: undefined,
			legendaryRatePerm: undefined,
			mythicRatePerm: undefined,
			sendRatePerm: undefined,
			panelType: undefined,
			reqActivating: undefined,
			deleteCommentsPerm: undefined
		};
		const commandsN: UnknownObject = {
			CMD_rate: undefined,
			CMD_unrate: undefined,
			CMD_feature: undefined,
			CMD_epic: undefined,
			CMD_unepic: undefined,
			CMD_verifycoins: undefined,
			CMD_daily: undefined,
			CMD_weekly: undefined,
			CMD_delete: undefined,
			CMD_setacc: undefined,
			CMD_rename: undefined,
			CMD_pass: undefined,
			CMD_description: undefined,
			CMD_unlist: undefined,
			CMD_song: undefined
		};
		try {
			const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(query, [roleId]);
			if (rows.length === 0) {
				return {
					properties: propertiesN,
					actions: actionsN,
					commands: commandsN
				};
			}

			const row = rows[0];
			let panelType: number;
			if (row.adminPanel == 1) {
				panelType = 3;
			} else if (row.advancedPanel == 1) {
				panelType = 2;
			} else {
				panelType = 1;
			}
			const properties: Properties = {
				rolename: row.roleName,
				color: row.commentColor,
				badge: row.modBadgeLevel
			};
			const actions: Actions = {
				diffRatePerm: row.actionRateDifficulty,
				starRatePerm: row.actionRateStars,
				rateDemonPerm: row.actionRateDemon,
				featuredRatePerm: row.actionRateFeature,
				epicRatePerm: row.actionRateEpic,
				legendaryRatePerm: row.actionRateLegendary,
				mythicRatePerm: row.actionRateMythic,
				sendRatePerm: row.actionSuggestRating,
				panelType: panelType,
				reqActivating: row.actionRequestMod,
				deleteCommentsPerm: row.actionDeleteComment
			};
			const commands: Commands = {
				CMD_rate: row.commandRate,
				CMD_unrate: row.commandUnrate,
				CMD_feature: row.commandFeature,
				CMD_epic: row.commandEpic,
				CMD_unepic: row.commandUnepic,
				CMD_verifycoins: row.commandVerifycoins,
				CMD_daily: row.commandDaily,
				CMD_weekly: row.commandWeekly,
				CMD_delete: row.commandDelete,
				CMD_setacc: row.commandSetacc,
				CMD_rename: row.commandRenameAll,
				CMD_pass: row.commandPassAll,
				CMD_description: row.commandDescriptionAll,
				CMD_unlist: row.commandUnlistAll,
				CMD_song: row.commandSongAll
			};

			return {
				properties: properties,
				actions: actions,
				commands: commands
			};
		} catch (error) {
			ConsoleApi.Error("main", `getRoleByIdException => public: Error retrieving role by ID: ${error}. Executed by: ${username} at net.fimastgd.forevercore.panel.roles.roles`);
			return {
				properties: propertiesN,
				actions: actionsN,
				commands: commandsN
			};
		}
	}
	public async editRole(username: string, rid: int, properties: Properties, actions: Actions, commands: Commands): Promise<object> {
		const panelProp: number[] = actions.panelType === 1 ? [0, 0] : actions.panelType === 2 ? [1, 0] : actions.panelType === 3 ? [0, 1] : [0, 0];
		// console.log('final: ' + JSON.stringify(commands, null, 2));
		const query = `UPDATE roles SET
			roleName = ?, commandRate = ?, commandUnrate = ?, commandFeature = ?, commandEpic = ?, commandUnepic = ?, commandVerifycoins = ?, commandDaily = ?, commandWeekly = ?, commandDelete = ?, commandSetacc = ?, commandRenameAll = ?, commandDescriptionAll = ?, commandPassAll = ?, commandUnlistAll = ?, commandSongAll = ?,
			actionRateDemon = ?, actionRateStars = ?, actionRateFeature = ?, actionRateEpic = ?, actionRateLegendary = ?, actionRateMythic = ?, actionRequestMod = ?, actionSuggestRating = ?, actionDeleteComment = ?, actionRateDifficulty = ?,
			commentColor = ?, modBadgeLevel = ?, advancedPanel = ?, adminPanel = ?
			WHERE roleID = ?`;

		try {
			await db.execute(query, [
				properties.rolename, commands.CMD_rate, commands.CMD_unrate, commands.CMD_feature, commands.CMD_epic, commands.CMD_unepic, commands.CMD_verifycoins, commands.CMD_daily, commands.CMD_weekly, commands.CMD_delete, commands.CMD_setacc, commands.CMD_rename, commands.CMD_description, commands.CMD_pass, commands.CMD_unlist, commands.CMD_song,
				actions.rateDemonPerm, actions.starRatePerm, actions.featuredRatePerm, actions.epicRatePerm, actions.legendaryRatePerm, actions.mythicRatePerm, actions.reqActivating, actions.sendRatePerm, actions.deleteCommentsPerm, actions.diffRatePerm,
				properties.color, properties.badge, panelProp[0], panelProp[1],
				rid
			]);
			ConsoleApi.Log("main", `Panel action: updated role ${properties.rolename}. Executed by: ${username}`);
			return {
				status: 1,
				message: "Role updated"
			};
		} catch (error) {
			ConsoleApi.Error("main", `editRoleException => public: Role update error: ${error}. Executed by: ${username} at net.fimastgd.forevercore.panel.roles.roles`);
			return {
				status: -1,
				message: `${error}`
			};
		}
	}
	public async getAllRoles(): Promise<object> {
		const [roles]: [RowDataPacket[], FieldPacket[]] = await db.execute('SELECT roleID FROM roles');
		const allRoles: { [key: number]: object } = {};

		for (const role of roles) {
			const roleID = role.roleID as int; 
			allRoles[roleID] = await this.getRoleContainer(roleID);
		}
		// const t = JSON.stringify(allRoles, null, 2);
		// ConsoleApi.Debug('main', t);
		return allRoles;
	}
	public async deleteRole(username: string, roleID: number): Promise<boolean> {
		try {
			const [result]: [any, FieldPacket[]] = await db.execute('DELETE FROM roles WHERE roleID = ?', [roleID]);
			if (result.affectedRows === 0) {
				ConsoleApi.Warn("main", `Panel action: role with ID ${roleID} not found. Executed by: ${username}`);
				return false;
			} else {
				ConsoleApi.Log("main", `Panel action: role with ID ${roleID} successfully deleted. Executed by: ${username}`);
				const [roleAssignResult]: [any, FieldPacket[]] = await db.execute('DELETE FROM roleassign WHERE roleID = ?', [roleID]);
				ConsoleApi.Log("main", `Panel action: deleted ${roleAssignResult.affectedRows} assignments with roleID = ${roleID}. Executed by: ${username}`);
				return true;
			}
		} catch (error) {
			ConsoleApi.Error('main', `deleteRoleException => public: Error while deleting role: ${error.message}. Executed by: ${username} at net.fimastgd.forevercore.panel.roles.roles`);
			return false;
		}
	}
	
	public async setRole(username: string, roleID: int): Promise<boolean> {
		try {
			if (!(await Panel.checkAccountLegit(username))) {
				return false;
			}
			const accountID: int = parseInt(await Panel.getIDbyUsername(username), 10);
			if (!(await this.checkRoleHandled(accountID, roleID))) {
				const [result]: [any, FieldPacket[]] = await db.execute('INSERT INTO roleassign (roleID, accountID) VALUES (?, ?)', [roleID, accountID]);
				ConsoleApi.Log("main", `Panel action: inserted role with roleID ${roleID} to ${username} (${accountID})`);
				return true;
			} else {
				return false;
			}
		} catch (error) {
			ConsoleApi.Error("main", `setRoleException => public: Error while inserting role: ${error.message} at net.fimastgd.forevercore.panel.roles.roles`);
			return false;
		}
	}
	public async unsetRole(username: string, roleID: int): Promise<boolean> {
		try {
			if (!(await Panel.checkAccountLegit(username))) {
				return false;
			}
			const accountID: int = parseInt(await Panel.getIDbyUsername(username), 10);
			// ConsoleApi.Debug("main", `rid: ${roleID}`);
			if (await this.checkRoleHandled(accountID, roleID)) {
				const [result]: [any, FieldPacket[]] = await db.execute('DELETE FROM roleassign WHERE roleID = ? AND accountID = ?', [roleID, accountID]);
				ConsoleApi.Log("main", `Panel action: unsetted role with roleID ${roleID} from ${username} (${accountID})`);
				return true;
			} else {
				return false;
			}
		} catch (error) {
			ConsoleApi.Error("main", `unsetRoleException => public: Error while unsetting role: ${error.message} at net.fimastgd.forevercore.panel.roles.roles`);
			return false;
		}
	}


	private async checkRoleHandled(accountID: int, roleID: int) {
		try {
			const [rows]: [RoleAssignRow[], FieldPacket[]] = await db.execute<RoleAssignRow[]>(
				'SELECT accountID FROM roleassign WHERE accountID = ? AND roleID = ?', 
				[accountID, roleID]
			);
			return rows.length > 0;
		} catch (error) {
			ConsoleApi.Error("main", `checkRoleHandledException => private: Error while checking role assign existence: ${error.message} at net.fimastgd.forevercore.panel.roles.roles`);
			return false;
		}
	}
	private async getRoleContainer(roleID: int): Promise<object> { // получение данных роли в объект
		const roleProp: GetRole = await this.getRoleById("[System]", roleID);
		const userList: string = await this.getRoleUsers(roleID);
		const roleContainer: object = {
			roleName: roleProp.properties.rolename,
			color: roleProp.properties.color,
			badge: roleProp.properties.badge,
			userList: userList
		};
		// const t = JSON.stringify(roleContainer, null, 2);
		// ConsoleApi.Debug('main', t);
		return roleContainer;
	}
	private async getRoleUsers(roleID: int): Promise<string> { // получение списка аккаунтов с определённой ролью через запятую
		try {
			const [rows]: [RoleAssignRow[], FieldPacket[]] = await db.execute<RoleAssignRow[]>('SELECT accountID FROM roleassign WHERE roleID = ?', [roleID]);
	
			if (rows.length === 0) {
				return ''; // если нет аккаунтов
			}
			const usernamePromises = rows.map(row => Panel.getUsernameByID(row.accountID));
			const usernames = await Promise.all(usernamePromises);
			// ConsoleApi.Debug("main", usernames.join(', '));
			return usernames.join(', ');
		} catch (error) {
			ConsoleApi.Error('main', `getRoleUsersException => private: Error while fetching role username list: ${error.message} at ${getpackage}`);
			return '';
		}
	}
} 