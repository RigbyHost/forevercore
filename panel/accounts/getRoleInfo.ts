import { Connection, RowDataPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";

/**
 * Интерфейс для записи назначения роли
 */
interface RoleAssign extends RowDataPacket {
	roleID: number;
}

/**
 * Интерфейс для записи роли
 */
interface Role extends RowDataPacket {
	roleName: string;
	advancedPanel: number;
	adminPanel: number;
}

/**
 * Интерфейс для информации о роли
 */
export interface RoleInfo {
	roleName: string;
	advancedPanel: number;
	adminPanel: number;
}

/**
 * Роль по умолчанию в случае отсутствия назначенных ролей
 */
const DEFAULT_ROLE: RoleInfo = {
	roleName: "Player",
	advancedPanel: 0,
	adminPanel: 0
};

/**
 * Получает информацию о роли пользователя
 * @param gdpsid - GDPS ID
 * @param accountID - ID аккаунта
 * @returns Информация о роли пользователя
 */
async function getRoleInfo(gdpsid: string, accountID: number | string): Promise<RoleInfo> {
	try {
		const db = await threadConnection(gdpsid);
		// Получаем ID роли из таблицы назначения ролей
		const [roleAssignRows] = await db.execute<RoleAssign[]>("SELECT roleID FROM roleassign WHERE accountID = ?", [accountID]);

		// Если роль не назначена, возвращаем роль по умолчанию
		if (roleAssignRows.length === 0) {
			ConsoleApi.Log("main", `No role assigned for accountID: ${accountID}, using default role`);
			return DEFAULT_ROLE;
		}

		const roleID = roleAssignRows[0].roleID;

		// Получаем данные роли из таблицы ролей
		const [roleRows] = await db.execute<Role[]>("SELECT roleName, advancedPanel, adminPanel FROM roles WHERE roleID = ?", [roleID]);

		// Если роль не найдена, возвращаем роль по умолчанию
		if (roleRows.length === 0) {
			ConsoleApi.Warn("main", `Role ID ${roleID} not found for accountID: ${accountID}, using default role`);
			return DEFAULT_ROLE;
		}

		// Возвращаем информацию о роли
		const { roleName, advancedPanel, adminPanel } = roleRows[0];
		ConsoleApi.Log("main", `Panel action: received role info. accountID: ${accountID}, roleName: ${roleName}`);

		return {
			roleName,
			advancedPanel,
			adminPanel
		};
	} catch (error) {
		ConsoleApi.Error("main", `Error retrieving role info for accountID ${accountID}: ${error}`);
		// В случае ошибки возвращаем роль по умолчанию
		return DEFAULT_ROLE;
	}
}

/**
 * Получает информацию о нескольких ролях пользователя (если у пользователя несколько ролей)
 * @param accountID - ID аккаунта
 * @returns Массив информации о ролях пользователя
 */
export async function getAllUserRoles(gdpsid: string, accountID: number | string): Promise<RoleInfo[]> {
	try {
		const db = await threadConnection(gdpsid);
		// Получаем все ID ролей пользователя
		const [roleAssignRows] = await db.execute<RoleAssign[]>("SELECT roleID FROM roleassign WHERE accountID = ?", [accountID]);

		// Если ролей нет, возвращаем массив с ролью по умолчанию
		if (roleAssignRows.length === 0) {
			return [DEFAULT_ROLE];
		}

		// Формируем список ID ролей для запроса
		const roleIDs = roleAssignRows.map(row => row.roleID);

		// Получаем информацию обо всех ролях
		const [roleRows] = await db.execute<Role[]>(
			`SELECT roleName, advancedPanel, adminPanel FROM roles 
       WHERE roleID IN (${roleIDs.map(() => "?").join(",")})`,
			roleIDs
		);

		// Если роли не найдены, возвращаем массив с ролью по умолчанию
		if (roleRows.length === 0) {
			return [DEFAULT_ROLE];
		}

		// Преобразуем результаты в массив информации о ролях
		return roleRows.map(({ roleName, advancedPanel, adminPanel }) => ({
			roleName,
			advancedPanel,
			adminPanel
		}));
	} catch (error) {
		ConsoleApi.Error("main", `Error retrieving all roles for accountID ${accountID}: ${error}`);
		// В случае ошибки возвращаем массив с ролью по умолчанию
		return [DEFAULT_ROLE];
	}
}

export default getRoleInfo;
