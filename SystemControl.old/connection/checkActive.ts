'package net.fimastgd.forevercore.SystemControl.connection.checkActive';

import { RowDataPacket } from 'mysql2/promise';
import manDB from '../../serverconf/man-db';
import ConsoleApi from '../../modules/console-api';

type json = string;
interface State {
	active: boolean, 
	isBanned: boolean
}

export async function checkActive(id: string, node: string): Promise<boolean> {
	try {
		// Подключение к центральному реестру
		const mandb = await manDB.createConnection("MANDB_PROCESS");
		// Получение ячейки state
		const [rows] = await mandb.execute<RowDataPacket[]>(
			`SELECT state FROM servers WHERE serverID = ? AND node = ?`, 
			[id, node]
		);
		// Получение JSON
		let result: json = rows[0].state;
		// Парсинг JSON в объект
		const props: State = JSON.parse(result);
		// Установка isActive на true если GDPS активен, на false если нет
		let isActive: boolean = Boolean(props.active);
		// возвращаем Promise<boolean>
		return isActive; 
	} catch (e) {
		ConsoleApi.Error("SystemControl", `${e} at net.fimastgd.forevercore.SystemControl.SystemControl.connection.checkActive`);
		return false;
	}
}  