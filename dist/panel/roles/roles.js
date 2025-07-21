// panel/roles/roles.ts
'package net.fimastgd.forevercore.panel.roles.roles';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Roles management system
 */
class Roles {
    /**
     * Get all roles in the system
     * @returns Array of roles
     */
    async getAllRoles() {
        try {
            const [rows] = await db_proxy_1.default.query('SELECT * FROM roles ORDER BY priority DESC');
            const roles = [];
            for (const row of rows) {
                // Extract properties
                const properties = {
                    id: row.roleID,
                    name: row.roleName,
                    priority: row.priority,
                    isDefault: row.isDefault === 1,
                    commentColor: row.commentColor,
                    modBadgeLevel: row.modBadgeLevel,
                    modipCategory: row.modipCategory
                };
                // Extract action permissions
                const actions = {};
                Object.keys(row).forEach(key => {
                    if (key.startsWith('action')) {
                        actions[key] = row[key];
                    }
                });
                // Extract command permissions
                const commands = {};
                Object.keys(row).forEach(key => {
                    if (key.startsWith('command')) {
                        commands[key] = row[key];
                    }
                });
                roles.push({
                    ...properties,
                    actions: actions,
                    commands: commands
                });
            }
            return roles;
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Failed to get all roles: ${error}`);
            return [];
        }
    }
    /**
     * Get a role by ID
     * @param adminName - Admin username requesting the role
     * @param roleId - Role ID to get
     * @returns Role object or null if not found
     */
    async getRoleById(adminName, roleId) {
        try {
            const [rows] = await db_proxy_1.default.query('SELECT * FROM roles WHERE roleID = ?', [roleId]);
            if (rows.length === 0) {
                console_api_1.default.Warn('Roles', `Role with ID ${roleId} not found. Requested by ${adminName}`);
                return null;
            }
            const row = rows[0];
            // Extract properties
            const properties = {
                id: row.roleID,
                name: row.roleName,
                priority: row.priority,
                isDefault: row.isDefault === 1,
                commentColor: row.commentColor,
                modBadgeLevel: row.modBadgeLevel,
                modipCategory: row.modipCategory
            };
            // Extract action permissions
            const actions = {};
            Object.keys(row).forEach(key => {
                if (key.startsWith('action')) {
                    actions[key] = row[key];
                }
            });
            // Extract command permissions
            const commands = {};
            Object.keys(row).forEach(key => {
                if (key.startsWith('command')) {
                    commands[key] = row[key];
                }
            });
            console_api_1.default.Log('Roles', `Got role with ID ${roleId}. Requested by ${adminName}`);
            return {
                ...properties,
                actions: actions,
                commands: commands
            };
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Failed to get role by ID ${roleId}: ${error}`);
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
    async createRole(adminName, properties, actions, commands) {
        try {
            // Prepare columns and values for dynamic query
            const columns = [];
            const values = [];
            const placeholders = [];
            // Add properties
            columns.push('roleName', 'priority', 'isDefault', 'commentColor', 'modBadgeLevel', 'modipCategory');
            values.push(properties.name, properties.priority, properties.isDefault ? 1 : 0, properties.commentColor, properties.modBadgeLevel, properties.modipCategory);
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
            const [result] = await db_proxy_1.default.execute(query, values);
            if (result.affectedRows === 1) {
                const roleId = result.insertId;
                console_api_1.default.Log('Roles', `Created role "${properties.name}" with ID ${roleId}. Created by ${adminName}`);
                return roleId;
            }
            else {
                console_api_1.default.Error('Roles', `Failed to create role "${properties.name}". Created by ${adminName}`);
                return null;
            }
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error creating role: ${error}`);
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
    async editRole(adminName, roleId, properties, actions, commands) {
        try {
            // Check if role exists
            const [checkRows] = await db_proxy_1.default.execute('SELECT roleID FROM roles WHERE roleID = ?', [roleId]);
            if (checkRows.length === 0) {
                console_api_1.default.Warn('Roles', `Attempted to edit non-existent role with ID ${roleId}. By ${adminName}`);
                return false;
            }
            // Prepare SET clause and values for dynamic query
            const setClauses = [];
            const values = [];
            // Add properties
            setClauses.push('roleName = ?', 'priority = ?', 'isDefault = ?', 'commentColor = ?', 'modBadgeLevel = ?', 'modipCategory = ?');
            values.push(properties.name, properties.priority, properties.isDefault ? 1 : 0, properties.commentColor, properties.modBadgeLevel, properties.modipCategory);
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
            const [result] = await db_proxy_1.default.execute(query, values);
            if (result.affectedRows === 1) {
                console_api_1.default.Log('Roles', `Updated role with ID ${roleId}. Updated by ${adminName}`);
                return true;
            }
            else {
                console_api_1.default.Error('Roles', `Failed to update role with ID ${roleId}. By ${adminName}`);
                return false;
            }
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error editing role: ${error}`);
            return false;
        }
    }
    /**
     * Delete a role
     * @param adminName - Admin username deleting the role
     * @param roleId - Role ID to delete
     * @returns True if successful, false otherwise
     */
    async deleteRole(adminName, roleId) {
        try {
            // Check if role exists
            const [checkRows] = await db_proxy_1.default.execute('SELECT roleName, isDefault FROM roles WHERE roleID = ?', [roleId]);
            if (checkRows.length === 0) {
                console_api_1.default.Warn('Roles', `Attempted to delete non-existent role with ID ${roleId}. By ${adminName}`);
                return false;
            }
            const roleName = checkRows[0].roleName;
            const isDefault = checkRows[0].isDefault;
            // Don't allow deleting default role
            if (isDefault === 1) {
                console_api_1.default.Warn('Roles', `Attempted to delete default role "${roleName}" with ID ${roleId}. By ${adminName}`);
                return false;
            }
            // Delete all role assignments first
            await db_proxy_1.default.execute('DELETE FROM roleassign WHERE roleID = ?', [roleId]);
            // Delete the role
            const [result] = await db_proxy_1.default.execute('DELETE FROM roles WHERE roleID = ?', [roleId]);
            if (result.affectedRows === 1) {
                console_api_1.default.Log('Roles', `Deleted role "${roleName}" with ID ${roleId}. Deleted by ${adminName}`);
                return true;
            }
            else {
                console_api_1.default.Error('Roles', `Failed to delete role "${roleName}" with ID ${roleId}. By ${adminName}`);
                return false;
            }
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error deleting role: ${error}`);
            return false;
        }
    }
    /**
     * Assign a role to a user
     * @param userName - Username to assign role to
     * @param roleId - Role ID to assign
     * @returns True if successful, false otherwise
     */
    async setRole(userName, roleId) {
        try {
            // Get account ID from username
            const [userRows] = await db_proxy_1.default.execute('SELECT accountID FROM accounts WHERE userName = ?', [userName]);
            if (userRows.length === 0) {
                console_api_1.default.Warn('Roles', `Failed to set role: User "${userName}" not found`);
                return false;
            }
            const accountId = userRows[0].accountID;
            // Check if role exists
            const [roleRows] = await db_proxy_1.default.execute('SELECT roleName FROM roles WHERE roleID = ?', [roleId]);
            if (roleRows.length === 0) {
                console_api_1.default.Warn('Roles', `Failed to set role: Role ID ${roleId} not found`);
                return false;
            }
            const roleName = roleRows[0].roleName;
            // Check if user already has this role
            const [assignRows] = await db_proxy_1.default.execute('SELECT * FROM roleassign WHERE accountID = ? AND roleID = ?', [accountId, roleId]);
            if (assignRows.length > 0) {
                console_api_1.default.Log('Roles', `User "${userName}" already has role "${roleName}"`);
                return true;
            }
            // Assign the role
            const [result] = await db_proxy_1.default.execute('INSERT INTO roleassign (accountID, roleID) VALUES (?, ?)', [accountId, roleId]);
            if (result.affectedRows === 1) {
                console_api_1.default.Log('Roles', `Assigned role "${roleName}" to user "${userName}"`);
                return true;
            }
            else {
                console_api_1.default.Error('Roles', `Failed to assign role "${roleName}" to user "${userName}"`);
                return false;
            }
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error setting role: ${error}`);
            return false;
        }
    }
    /**
     * Remove a role from a user
     * @param userName - Username to remove role from
     * @param roleId - Role ID to remove
     * @returns True if successful, false otherwise
     */
    async unsetRole(userName, roleId) {
        try {
            // Get account ID from username
            const [userRows] = await db_proxy_1.default.execute('SELECT accountID FROM accounts WHERE userName = ?', [userName]);
            if (userRows.length === 0) {
                console_api_1.default.Warn('Roles', `Failed to unset role: User "${userName}" not found`);
                return false;
            }
            const accountId = userRows[0].accountID;
            // Check if role exists
            const [roleRows] = await db_proxy_1.default.execute('SELECT roleName FROM roles WHERE roleID = ?', [roleId]);
            if (roleRows.length === 0) {
                console_api_1.default.Warn('Roles', `Failed to unset role: Role ID ${roleId} not found`);
                return false;
            }
            const roleName = roleRows[0].roleName;
            // Remove the role
            const [result] = await db_proxy_1.default.execute('DELETE FROM roleassign WHERE accountID = ? AND roleID = ?', [accountId, roleId]);
            if (result.affectedRows > 0) {
                console_api_1.default.Log('Roles', `Removed role "${roleName}" from user "${userName}"`);
                return true;
            }
            else {
                console_api_1.default.Log('Roles', `User "${userName}" did not have role "${roleName}"`);
                return false;
            }
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error unsetting role: ${error}`);
            return false;
        }
    }
    /**
     * Get all roles assigned to a user
     * @param userName - Username to get roles for
     * @returns Array of assigned roles
     */
    async getUserRoles(userName) {
        try {
            // Get account ID from username
            const [userRows] = await db_proxy_1.default.execute('SELECT accountID FROM accounts WHERE userName = ?', [userName]);
            if (userRows.length === 0) {
                console_api_1.default.Warn('Roles', `Failed to get user roles: User "${userName}" not found`);
                return [];
            }
            const accountId = userRows[0].accountID;
            // Get role IDs assigned to user
            const [assignRows] = await db_proxy_1.default.execute('SELECT roleID FROM roleassign WHERE accountID = ?', [accountId]);
            if (assignRows.length === 0) {
                return [];
            }
            // Create array of role IDs
            const roleIds = assignRows.map(row => row.roleID);
            // Get role details
            const [roleRows] = await db_proxy_1.default.execute(`SELECT * FROM roles WHERE roleID IN (${roleIds.map(() => '?').join(',')})`, roleIds);
            const roles = [];
            for (const row of roleRows) {
                // Extract properties
                const properties = {
                    id: row.roleID,
                    name: row.roleName,
                    priority: row.priority,
                    isDefault: row.isDefault === 1,
                    commentColor: row.commentColor,
                    modBadgeLevel: row.modBadgeLevel,
                    modipCategory: row.modipCategory
                };
                // Extract action permissions
                const actions = {};
                Object.keys(row).forEach(key => {
                    if (key.startsWith('action')) {
                        actions[key] = row[key];
                    }
                });
                // Extract command permissions
                const commands = {};
                Object.keys(row).forEach(key => {
                    if (key.startsWith('command')) {
                        commands[key] = row[key];
                    }
                });
                roles.push({
                    ...properties,
                    actions: actions,
                    commands: commands
                });
            }
            // Sort by priority
            roles.sort((a, b) => b.priority - a.priority);
            return roles;
        }
        catch (error) {
            console_api_1.default.Error('Roles', `Error getting user roles: ${error}`);
            return [];
        }
    }
}
exports.Roles = Roles;
exports.default = Roles;
