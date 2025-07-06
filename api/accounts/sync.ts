"package net.fimastgd.forevercore.api.accounts.sync";

import { Request } from "express";
import path from "path";
import fs from "fs/promises";
import { RowDataPacket } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import GeneratePass from "../lib/generatePass";
import ExploitPatch from "../lib/exploitPatch";
import ConsoleApi from "../../modules/console-api";
// import { getSettings } from '../../serverconf/settings';

/**
 * Синхронизирует данные сохранения аккаунта GD из базы данных или файла
 * @param userNameStr - Имя пользователя
 * @param accountIDStr - ID аккаунта
 * @param passwordStr - Пароль
 * @param gjp2Str - GJP2 хеш
 * @param req - Express запрос
 * @returns Данные сохранения если успешно, "-1" если ошибка, "-2" если неверный пароль
 */
const syncAccount = async (
	gdpsid: string,
	userNameStr?: string,
	accountIDStr?: string,
	passwordStr?: string,
	gjp2Str?: string,
	req?: Request
): Promise<string> => {
	const db = await threadConnection(gdpsid);
	try {
		// Логируем запрос
		ConsoleApi.Log("main", `Sync request received for account ${accountIDStr || userNameStr}`);

		// Базовая валидация входных данных
		if (!userNameStr && !accountIDStr) {
			ConsoleApi.Error("main", `Failed to sync account: missing required parameters`);
			return "-1";
		}

		const password = passwordStr || "";
		let accountID = accountIDStr || "";

		// Получить ID аккаунта по имени пользователя, если не предоставлен
		if (!accountID) {
			try {
				const userName = await ExploitPatch.remove(userNameStr);
				const [rows] = await db.execute<RowDataPacket[]>("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
				accountID = rows.length ? rows[0].accountID.toString() : null;

				if (!accountID) {
					ConsoleApi.Log("main", `Failed to sync account: account not found`);
					return "-1";
				}
			} catch (err) {
				ConsoleApi.Error("main", `Error getting account ID: ${err}`);
				return "-1";
			}
		} else {
			accountID = await ExploitPatch.remove(accountIDStr);
		}

		// Проверить учетные данные
		let pass = 0;
		try {
			if (passwordStr) {
				pass = await GeneratePass.isValid(gdpsid, accountID, passwordStr, req);
			} else if (gjp2Str) {
				pass = await GeneratePass.isGJP2Valid(gdpsid, accountID, gjp2Str, req);
			}

			if (pass !== 1) {
				ConsoleApi.Log("main", `Failed to sync account: ${accountID} - authentication failed`);
				return "-2";
			}
		} catch (err) {
			ConsoleApi.Error("main", `Error in authentication: ${err}`);
			return "-1";
		}

		// Получить данные сохранения
		let saveData: string = "";

		// Сначала проверим наличие файла последнего бэкапа на диске
		try {
			const backupDir = path.join(__dirname, "..", "..", "data", "backups", `${accountID}`);

			// Проверяем существование директории
			try {
				await fs.access(backupDir);
			} catch (err) {
				// Директория не существует, используем данные из БД
				throw new Error("Backup directory does not exist");
			}

			// Получаем список файлов бэкапов
			const files = await fs.readdir(backupDir);

			// Фильтруем только файлы формата backup_*.dat
			const backupFiles = files
				.filter(file => file.match(/^backup_\d+\.dat$/))
				.map(file => ({
					name: file,
					path: path.join(backupDir, file),
					time: parseInt(file.replace("backup_", "").replace(".dat", ""))
				}))
				.sort((a, b) => b.time - a.time); // Сортируем по времени (самые новые первые)

			// Если есть бэкапы, используем самый свежий
			if (backupFiles.length > 0) {
				saveData = await fs.readFile(backupFiles[0].path, "utf8");
			} else {
				throw new Error("No backup files found");
			}
		} catch (err) {
			// Если возникла ошибка с файлами, используем данные из БД
			ConsoleApi.Log("main", `No backup files found on disk, using DB: ${err}`);

			try {
				const [rows] = await db.execute<RowDataPacket[]>("SELECT saveData FROM accounts WHERE accountID = ?", [accountID]);

				if (rows.length === 0 || !rows[0].saveData) {
					ConsoleApi.Log("main", `Failed to sync account ${accountID}: no save data found`);
					return "-1";
				}

				saveData = rows[0].saveData;
			} catch (dbErr) {
				ConsoleApi.Error("main", `Error getting save data from DB: ${dbErr}`);
				return "-1";
			}
		}

		// Обновить время последней синхронизации
		try {
			await db.execute("UPDATE accounts SET lastSync = ? WHERE accountID = ?", [Math.floor(Date.now() / 1000), accountID]);
		} catch (err) {
			ConsoleApi.Error("main", `Error updating lastSync time: ${err}`);
			// Продолжаем выполнение, так как основная задача - вернуть данные сохранения
		}

		ConsoleApi.Log("main", `Synced account: ${accountID}`);

		// Возвращаем данные в нужном формате
		return `${saveData};21;30;a;a`;
	} catch (error) {
		ConsoleApi.Warn("main", `Check the data for damage at net.fimastgd.forevercore.api.accounts.sync`);
		ConsoleApi.Error("main", `Unhandled server exception with user sync account: ${error}`);
		return "-1";
	}
};

export default syncAccount;
