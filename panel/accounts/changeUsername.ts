import { ResultSetHeader } from "mysql2/promise";
import threadConnection from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";

/**
 * Изменяет имя пользователя
 * @param gdpsid - GDPS ID
 * @param newusr - Новое имя пользователя
 * @param userName - Текущее имя пользователя
 * @returns "1" если успешно, "-2" если имя слишком длинное, "-3" если имя слишком короткое,
 *          "-4" при системной ошибке, "-5" если имя уже занято
 */
const changeUsername = async (gdpsid: string, newusr: string, userName: string): Promise<string> => {
	try {
		const db = await threadConnection(gdpsid);
		// Валидация длины имени пользователя
		if (newusr.length > 20) {
			ConsoleApi.Log("main", `Panel action: new username "${newusr}" more than 20 symbols`);
			return "-2";
		}

		if (newusr.length < 3) {
			ConsoleApi.Log("main", `Panel action: new username "${newusr}" less than 3 symbols`);
			return "-3";
		}

		// Валидация символов в имени пользователя
		const validUsernameRegex = /^[a-zA-Z0-9_.-]+$/;
		if (!validUsernameRegex.test(newusr)) {
			ConsoleApi.Log("main", `Panel action: new username "${newusr}" contains invalid characters`);
			return "-6";
		}

		// Проверка, не занято ли уже имя
		const [existingUsers] = await db.execute("SELECT COUNT(*) as count FROM accounts WHERE LOWER(userName) = LOWER(?)", [newusr]);

		// @ts-ignore - Проверяем, что existingUsers[0].count равно 0
		if (existingUsers[0].count > 0) {
			ConsoleApi.Log("main", `Panel action: username "${newusr}" already taken`);
			return "-5";
		}

		// Обновление имени пользователя
		const [result] = await db.execute<ResultSetHeader>("UPDATE accounts SET userName = ? WHERE LOWER(userName) = LOWER(?)", [newusr, userName]);

		// Проверка успешности обновления
		if (result.affectedRows === 0) {
			ConsoleApi.Log("main", `Panel action: account "${userName}" not found`);
			return "-7"; // Аккаунт не найден
		}

		// Обновление связанных таблиц, где используется имя пользователя

		// Обновление таблицы users, если она используется для игрового профиля
		await db.execute("UPDATE users SET userName = ? WHERE LOWER(userName) = LOWER(?)", [newusr, userName]).catch(err => {
			ConsoleApi.Error("main", `Error updating users table: ${err}`);
			// Не прерываем выполнение - основная таблица уже обновлена
		});

		// Логирование успешного изменения
		ConsoleApi.Log("main", `Panel action: username changed (${userName} => ${newusr})`);
		return "1";
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changeUsername`);
		return "-4"; // Системная ошибка
	}
};

export default changeUsername;
