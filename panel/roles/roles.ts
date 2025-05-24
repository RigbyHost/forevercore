// panel/roles/roles.ts
'package net.fimastgd.forevercore.panel.roles.roles';

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';
import ApiLib from '../../api/lib/apiLib';

/**
 * Interface for role properties
 */
export interface RoleProperties {
	id?: number;
	name: string;
	priority: number;
	isDefault?: boolean;
	commentColor: string;
	modBadgeLevel: number;
	modipCategory: number;
}

/**
 * Interface for role actions (permissions)
 */
export interface RoleActions {
	[key: string]: number;
	actionRateStars: number;
	actionRateFeature: number;
	actionRateEpic: number;
	actionRateLegendary: number;
	actionRateMythic: number;
	actionRateDemon: number;
	actionSuggestRating: number;
	actionVerifyCoins: number;
	actionDeleteComment: number;
	actionRequestMod: number;
}

/**
 * Interface for role commands (permissions)
 */
export interface RoleCommands {
	[key: string]: number;
	commandRate: number;
	commandFeature: number;
	commandEpic: number;
	commandVerifycoins: number;
	commandDaily: number;
	commandWeekly: number;
	commandDelete: number;
	commandSetacc: number;
	commandRenameAll: number;
	commandRenameOwn: number;
	commandDescriptionAll: number;
	commandDescriptionOwn: number;
	commandUnrate: number;
	commandUnepic: number;
	commandUnverifycoins: number;
}

/**
 * Interface for a complete role definition
 */
export interface Role extends RoleProperties {
	actions?: RoleActions;
	commands?: RoleCommands;
}

/**
 * Roles management system
 */
export class Roles {
	/**
	 * Get all roles in the system
	 * @returns Array of roles
	 */
	async getAllRoles(): Promise<Role[]> {
		try {
			const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM roles ORDER BY priority DESC');

			const roles: Role[] = [];

			for (const row of rows) {
				// Extract properties
				const properties: RoleProperties = {
					id: row.roleID,
					name: row.roleName,
					priority: row.priority,
					isDefault: row.isDefault === 1,
					commentColor: row.commentColor,
					modBadgeLevel: row.modBadgeLevel,
					modipCategory: row.modipCategory
				};

				// Extract action permissions
				const actions: Partial<RoleActions> = {};
				Object.keys(row).forEach(key => {
					if (key.startsWith('action')) {
						actions[key] = row[key];
					}
				});

				// Extract command permissions
				const commands: Partial<RoleCommands> = {};
				Object.keys(row).forEach(key => {
					if (key.startsWith('command')) {
						commands[key] = row[key];
					}
				});

				roles.push({
					...properties,
					actions: actions as RoleActions,
					commands: commands as RoleCommands
				});
			}

			return roles;
		} catch (error) {
			ConsoleApi.Error('Roles', `Failed to get all roles: ${error}`);
			return [];
		}
	}

	/**
	 * Get a role by ID
	 * @param adminName - Admin username requesting the role
	 * @param roleId - Role ID to get
	 * @returns Role object or null if not found
	 */
	async getRoleById(adminName: string, roleId: number): Promise<Role | null> {
		try {
			const [rows] = await db.query<RowDataPacket[]>(
				'SELECT * FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (rows.length === 0) {
				ConsoleApi.Warn('Roles', `Role with ID ${roleId} not found. Requested by ${adminName}`);
				return null;
			}

			const row = rows[0];

			// Extract properties
			const properties: RoleProperties = {
				id: row.roleID,
				name: row.roleName,
				priority: row.priority,
				isDefault: row.isDefault === 1,
				commentColor: row.commentColor,
				modBadgeLevel: row.modBadgeLevel,
				modipCategory: row.modipCategory
			};

			// Extract action permissions
			const actions: Partial<RoleActions> = {};
			Object.keys(row).forEach(key => {
				if (key.startsWith('action')) {
					actions[key] = row[key];
				}
			});

			// Extract command permissions
			const commands: Partial<RoleCommands> = {};
			Object.keys(row).forEach(key => {
				if (key.startsWith('command')) {
					commands[key] = row[key];
				}
			});

			ConsoleApi.Log('Roles', `Got role with ID ${roleId}. Requested by ${adminName}`);

			return {
				...properties,
				actions: actions as RoleActions,
				commands: commands as RoleCommands
			};
		} catch (error) {
			ConsoleApi.Error('Roles', `Failed to get role by ID ${roleId}: ${error}`);
			return null;
		}
	}

	/**
	 * Create a new role
	 * @param adminName - Admin username creating the role
	 * @param properties - Role properties
	 * @param actions - Role action permissions
	 * @param commands - Role command permissions
	 * @returns Created role ID or null if failed
	 */
	async createRole(
		adminName: string,
		properties: RoleProperties,
		actions: RoleActions,
		commands: RoleCommands
	): Promise<number | null> {
		try {
			// Prepare columns and values for dynamic query
			const columns: string[] = [];
			const values: any[] = [];
			const placeholders: string[] = [];

			// Add properties
			columns.push('roleName', 'priority', 'isDefault', 'commentColor', 'modBadgeLevel', 'modipCategory');
			values.push(
				properties.name,
				properties.priority,
				properties.isDefault ? 1 : 0,
				properties.commentColor,
				properties.modBadgeLevel,
				properties.modipCategory
			);
			placeholders.push('?', '?', '?', '?', '?', '?');

			// Add actions
			Object.entries(actions).forEach(([key, value]) => {
				columns.push(key);
				values.push(value);
				placeholders.push('?');
			});

			// Add commands
			Object.entries(commands).forEach(([key, value]) => {
				columns.push(key);
				values.push(value);
				placeholders.push('?');
			});

			// Create the query
			const query = `INSERT INTO roles (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

			// Execute the query
			const [result] = await db.execute<ResultSetHeader>(query, values);

			if (result.affectedRows === 1) {
				const roleId = result.insertId;
				ConsoleApi.Log('Roles', `Created role "${properties.name}" with ID ${roleId}. Created by ${adminName}`);
				return roleId;
			} else {
				ConsoleApi.Error('Roles', `Failed to create role "${properties.name}". Created by ${adminName}`);
				return null;
			}
		} catch (error) {
			ConsoleApi.Error('Roles', `Error creating role: ${error}`);
			return null;
		}
	}

	/**
	 * Edit an existing role
	 * @param adminName - Admin username editing the role
	 * @param roleId - Role ID to edit
	 * @param properties - Updated role properties
	 * @param actions - Updated role action permissions
	 * @param commands - Updated role command permissions
	 * @returns True if successful, false otherwise
	 */
	async editRole(
		adminName: string,
		roleId: number,
		properties: RoleProperties,
		actions: RoleActions,
		commands: RoleCommands
	): Promise<boolean> {
		try {
			// Check if role exists
			const [checkRows] = await db.execute<RowDataPacket[]>(
				'SELECT roleID FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (checkRows.length === 0) {
				ConsoleApi.Warn('Roles', `Attempted to edit non-existent role with ID ${roleId}. By ${adminName}`);
				return false;
			}

			// Prepare SET clause and values for dynamic query
			const setClauses: string[] = [];
			const values: any[] = [];

			// Add properties
			setClauses.push('roleName = ?', 'priority = ?', 'isDefault = ?', 'commentColor = ?', 'modBadgeLevel = ?', 'modipCategory = ?');
			values.push(
				properties.name,
				properties.priority,
				properties.isDefault ? 1 : 0,
				properties.commentColor,
				properties.modBadgeLevel,
				properties.modipCategory
			);

			// Add actions
			Object.entries(actions).forEach(([key, value]) => {
				setClauses.push(`${key} = ?`);
				values.push(value);
			});

			// Add commands
			Object.entries(commands).forEach(([key, value]) => {
				setClauses.push(`${key} = ?`);
				values.push(value);
			});

			// Add roleId to values
			values.push(roleId);

			// Create the query
			const query = `UPDATE roles SET ${setClauses.join(', ')} WHERE roleID = ?`;

			// Execute the query
			const [result] = await db.execute<ResultSetHeader>(query, values);

			if (result.affectedRows === 1) {
				ConsoleApi.Log('Roles', `Updated role with ID ${roleId}. Updated by ${adminName}`);
				return true;
			} else {
				ConsoleApi.Error('Roles', `Failed to update role with ID ${roleId}. By ${adminName}`);
				return false;
			}
		} catch (error) {
			ConsoleApi.Error('Roles', `Error editing role: ${error}`);
			return false;
		}
	}

	/**
	 * Delete a role
	 * @param adminName - Admin username deleting the role
	 * @param roleId - Role ID to delete
	 * @returns True if successful, false otherwise
	 */
	async deleteRole(adminName: string, roleId: number): Promise<boolean> {
		try {
			// Check if role exists
			const [checkRows] = await db.execute<RowDataPacket[]>(
				'SELECT roleName, isDefault FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (checkRows.length === 0) {
				ConsoleApi.Warn('Roles', `Attempted to delete non-existent role with ID ${roleId}. By ${adminName}`);
				return false;
			}

			const roleName = checkRows[0].roleName;
			const isDefault = checkRows[0].isDefault;

			// Don't allow deleting default role
			if (isDefault === 1) {
				ConsoleApi.Warn('Roles', `Attempted to delete default role "${roleName}" with ID ${roleId}. By ${adminName}`);
				return false;
			}

			// Delete all role assignments first
			await db.execute(
				'DELETE FROM roleassign WHERE roleID = ?',
				[roleId]
			);

			// Delete the role
			const [result] = await db.execute<ResultSetHeader>(
				'DELETE FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (result.affectedRows === 1) {
				ConsoleApi.Log('Roles', `Deleted role "${roleName}" with ID ${roleId}. Deleted by ${adminName}`);
				return true;
			} else {
				ConsoleApi.Error('Roles', `Failed to delete role "${roleName}" with ID ${roleId}. By ${adminName}`);
				return false;
			}
		} catch (error) {
			ConsoleApi.Error('Roles', `Error deleting role: ${error}`);
			return false;
		}
	}

	/**
	 * Assign a role to a user
	 * @param userName - Username to assign role to
	 * @param roleId - Role ID to assign
	 * @returns True if successful, false otherwise
	 */
	async setRole(userName: string, roleId: number): Promise<boolean> {
		try {
			// Get account ID from username
			const [userRows] = await db.execute<RowDataPacket[]>(
				'SELECT accountID FROM accounts WHERE userName = ?',
				[userName]
			);

			if (userRows.length === 0) {
				ConsoleApi.Warn('Roles', `Failed to set role: User "${userName}" not found`);
				return false;
			}

			const accountId = userRows[0].accountID;

			// Check if role exists
			const [roleRows] = await db.execute<RowDataPacket[]>(
				'SELECT roleName FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (roleRows.length === 0) {
				ConsoleApi.Warn('Roles', `Failed to set role: Role ID ${roleId} not found`);
				return false;
			}

			const roleName = roleRows[0].roleName;

			// Check if user already has this role
			const [assignRows] = await db.execute<RowDataPacket[]>(
				'SELECT * FROM roleassign WHERE accountID = ? AND roleID = ?',
				[accountId, roleId]
			);

			if (assignRows.length > 0) {
				ConsoleApi.Log('Roles', `User "${userName}" already has role "${roleName}"`);
				return true;
			}

			// Assign the role
			const [result] = await db.execute<ResultSetHeader>(
				'INSERT INTO roleassign (accountID, roleID) VALUES (?, ?)',
				[accountId, roleId]
			);

			if (result.affectedRows === 1) {
				ConsoleApi.Log('Roles', `Assigned role "${roleName}" to user "${userName}"`);
				return true;
			} else {
				ConsoleApi.Error('Roles', `Failed to assign role "${roleName}" to user "${userName}"`);
				return false;
			}
		} catch (error) {
			ConsoleApi.Error('Roles', `Error setting role: ${error}`);
			return false;
		}
	}

	/**
	 * Remove a role from a user
	 * @param userName - Username to remove role from
	 * @param roleId - Role ID to remove
	 * @returns True if successful, false otherwise
	 */
	async unsetRole(userName: string, roleId: number): Promise<boolean> {
		try {
			// Get account ID from username
			const [userRows] = await db.execute<RowDataPacket[]>(
				'SELECT accountID FROM accounts WHERE userName = ?',
				[userName]
			);

			if (userRows.length === 0) {
				ConsoleApi.Warn('Roles', `Failed to unset role: User "${userName}" not found`);
				return false;
			}

			const accountId = userRows[0].accountID;

			// Check if role exists
			const [roleRows] = await db.execute<RowDataPacket[]>(
				'SELECT roleName FROM roles WHERE roleID = ?',
				[roleId]
			);

			if (roleRows.length === 0) {
				ConsoleApi.Warn('Roles', `Failed to unset role: Role ID ${roleId} not found`);
				return false;
			}

			const roleName = roleRows[0].roleName;

			// Remove the role
			const [result] = await db.execute<ResultSetHeader>(
				'DELETE FROM roleassign WHERE accountID = ? AND roleID = ?',
				[accountId, roleId]
			);

			if (result.affectedRows > 0) {
				ConsoleApi.Log('Roles', `Removed role "${roleName}" from user "${userName}"`);
				return true;
			} else {
				ConsoleApi.Log('Roles', `User "${userName}" did not have role "${roleName}"`);
				return false;
			}
		} catch (error) {
			ConsoleApi.Error('Roles', `Error unsetting role: ${error}`);
			return false;
		}
	}

	/**
	 * Get all roles assigned to a user
	 * @param userName - Username to get roles for
	 * @returns Array of assigned roles
	 */
	async getUserRoles(userName: string): Promise<Role[]> {
		try {
			// Get account ID from username
			const [userRows] = await db.execute<RowDataPacket[]>(
				'SELECT accountID FROM accounts WHERE userName = ?',
				[userName]
			);

			if (userRows.length === 0) {
				ConsoleApi.Warn('Roles', `Failed to get user roles: User "${userName}" not found`);
				return [];
			}

			const accountId = userRows[0].accountID;

			// Get role IDs assigned to user
			const [assignRows] = await db.execute<RowDataPacket[]>(
				'SELECT roleID FROM roleassign WHERE accountID = ?',
				[accountId]
			);

			if (assignRows.length === 0) {
				return [];
			}

			// Create array of role IDs
			const roleIds = assignRows.map(row => row.roleID);

			// Get role details
			const [roleRows] = await db.execute<RowDataPacket[]>(
				`SELECT * FROM roles WHERE roleID IN (${roleIds.map(() => '?').join(',')})`,
				roleIds
			);

			const roles: Role[] = [];

			for (const row of roleRows) {
				// Extract properties
				const properties: RoleProperties = {
					id: row.roleID,
					name: row.roleName,
					priority: row.priority,
					isDefault: row.isDefault === 1,
					commentColor: row.commentColor,
					modBadgeLevel: row.modBadgeLevel,
					modipCategory: row.modipCategory
				};

				// Extract action permissions
				const actions: Partial<RoleActions> = {};
				Object.keys(row).forEach(key => {
					if (key.startsWith('action')) {
						actions[key] = row[key];
					}
				});

				// Extract command permissions
				const commands: Partial<RoleCommands> = {};
				Object.keys(row).forEach(key => {
					if (key.startsWith('command')) {
						commands[key] = row[key];
					}
				});

				roles.push({
					...properties,
					actions: actions as RoleActions,
					commands: commands as RoleCommands
				});
			}

			// Sort by priority
			roles.sort((a, b) => b.priority - a.priority);

			return roles;
		} catch (error) {
			ConsoleApi.Error('Roles', `Error getting user roles: ${error}`);
			return [];
		}
	}
}

export default Roles;