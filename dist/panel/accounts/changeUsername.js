"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Изменяет имя пользователя
 * @param newusr - Новое имя пользователя
 * @param userName - Текущее имя пользователя
 * @returns "1" если успешно, "-2" если имя слишком длинное, "-3" если имя слишком короткое,
 *          "-4" при системной ошибке, "-5" если имя уже занято
 */
const changeUsername = async (newusr, userName) => {
    try {
        // Валидация длины имени пользователя
        if (newusr.length > 20) {
            console_api_1.default.Log("main", `Panel action: new username "${newusr}" more than 20 symbols`);
            return "-2";
        }
        if (newusr.length < 3) {
            console_api_1.default.Log("main", `Panel action: new username "${newusr}" less than 3 symbols`);
            return "-3";
        }
        // Валидация символов в имени пользователя
        const validUsernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!validUsernameRegex.test(newusr)) {
            console_api_1.default.Log("main", `Panel action: new username "${newusr}" contains invalid characters`);
            return "-6";
        }
        // Проверка, не занято ли уже имя
        const [existingUsers] = await db_proxy_1.default.execute("SELECT COUNT(*) as count FROM accounts WHERE LOWER(userName) = LOWER(?)", [newusr]);
        // @ts-ignore - Проверяем, что existingUsers[0].count равно 0
        if (existingUsers[0].count > 0) {
            console_api_1.default.Log("main", `Panel action: username "${newusr}" already taken`);
            return "-5";
        }
        // Обновление имени пользователя
        const [result] = await db_proxy_1.default.execute("UPDATE accounts SET userName = ? WHERE LOWER(userName) = LOWER(?)", [newusr, userName]);
        // Проверка успешности обновления
        if (result.affectedRows === 0) {
            console_api_1.default.Log("main", `Panel action: account "${userName}" not found`);
            return "-7"; // Аккаунт не найден
        }
        // Обновление связанных таблиц, где используется имя пользователя
        // Обновление таблицы users, если она используется для игрового профиля
        await db_proxy_1.default.execute("UPDATE users SET userName = ? WHERE LOWER(userName) = LOWER(?)", [newusr, userName]).catch(err => {
            console_api_1.default.Error("main", `Error updating users table: ${err}`);
            // Не прерываем выполнение - основная таблица уже обновлена
        });
        // Логирование успешного изменения
        console_api_1.default.Log("main", `Panel action: username changed (${userName} => ${newusr})`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changeUsername`);
        return "-4"; // Системная ошибка
    }
};
exports.default = changeUsername;
