'package net.fimastgd.forevercore.SystemControl.validation.expired';

import { RowDataPacket } from 'mysql2/promise';
import manDB from '../../serverconf/man-db';
import ConsoleApi from '../../modules/console-api';

export async function expired(id: string, node: string): Promise<boolean> {
	try {
		// Подключение к базе данных
		const mandb = await manDB.createConnection("MANDB_PROCESS");
		// Выполнение запроса для получения строки
		const [rows] = await mandb.execute<RowDataPacket[]>(
			`SELECT dates FROM servers
				WHERE serverID = ? AND node = ?`,
			[id, node]
		);
		// Проверка, есть ли данные
		if (rows.length === 0) {
			ConsoleApi.Warn("SystemControl", `String with serverID = ${id} and node = ${node} not found at net.fimastgd.forevercore.SystemControl.validation.expired`);
			return false;
		}
		// Извлечение поля dates
		const dates = rows[0].dates;
		// Парсинг JSON
		const datesJson = JSON.parse(dates);
		// Получение даты expires
		const expiresDateStr = datesJson.expires;
		// Преобразование строки expires в объект Date
		const expiresDate = new Date(expiresDateStr);
		// Получение текущей даты
		const currentDate = new Date();
		// Сравнение дат
		if (currentDate > expiresDate) {
			// GDPS истёк
			return true;
		} else {
			// GDPS действителен
			return false;
		}
	} catch (e) {
		ConsoleApi.Error("SystemControl", `${e.message} at net.fimastgd.forevercore.SystemControl.validation.expired`);
		return true;
	}
}
