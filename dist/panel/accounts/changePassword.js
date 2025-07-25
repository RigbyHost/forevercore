"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const generatePass_1 = __importDefault(require("../../api/lib/generatePass"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Изменяет пароль пользователя и обновляет связанные данные
 * @param req - Express запрос с необходимыми параметрами
 * @returns "1" в случае успеха, "-1" при неверном пароле, "-2" при других ошибках
 */
const changePassword = async (req) => {
    const { userName, oldpassword, newpassword, accid } = req.body;
    try {
        // Проверка старого пароля
        const pass = await generatePass_1.default.isValidUsrname(userName, oldpassword, req);
        if (pass !== 1) {
            return "-1"; // Неверный старый пароль
        }
        // Валидация нового пароля
        if (newpassword.length < 6) {
            return "-3"; // Пароль слишком короткий
        }
        // Хеширование нового пароля
        const passhash = await bcryptjs_1.default.hash(newpassword, 10);
        // Обновление пароля в базе данных
        await db_proxy_1.default.query("UPDATE accounts SET password=? WHERE userName=?", [passhash, userName]);
        // Обновление GJP2 хеша
        await generatePass_1.default.assignGJP2(accid, newpassword, req);
        // Получение ID аккаунта
        const [rows] = await db_proxy_1.default.query("SELECT accountID FROM accounts WHERE userName=?", [userName]);
        if (rows.length === 0) {
            console_api_1.default.Error("main", `Account not found after password change: ${userName}`);
            return "1"; // Пароль изменен, но не удалось обработать файлы сохранений
        }
        const accountID = rows[0].accountID;
        const accountIDPS = accountID.toString();
        // Путь к файлу сохранения и ключу
        const saveDataPath = path_1.default.join(__dirname, '../../data/accounts', `${accountIDPS}.dat`);
        const keyPath = path_1.default.join(__dirname, '../../data/accounts/keys', accountIDPS);
        // Проверяем существование файла сохранения
        let saveData;
        try {
            saveData = await promises_1.default.readFile(saveDataPath, 'utf8');
        }
        catch (error) {
            // Файл сохранения не существует, продолжаем без него
            console_api_1.default.Log("main", `No save data found for account ${userName}`);
            console_api_1.default.Log("main", `Panel action: changed password in account ${userName}`);
            return "1";
        }
        // Проверяем существование файла ключа
        try {
            if (await promises_1.default.access(keyPath).then(() => true).catch(() => false)) {
                const protected_key_encoded = await promises_1.default.readFile(keyPath, 'utf8');
                if (protected_key_encoded) {
                    // Здесь должна быть реальная реализация расшифровки
                    // с использованием актуальных библиотек
                    // В реальной реализации:
                    // 1. Разблокировать ключ с использованием старого пароля
                    // 2. Расшифровать данные сохранения
                    // 3. Перешифровать с новым паролем (при необходимости)
                    // 4. Сохранить обновленные данные
                    try {
                        // Здесь должен быть реальный код расшифровки/шифрования
                        // Заглушка для примера:
                        await promises_1.default.writeFile(saveDataPath, saveData, 'utf8');
                        await promises_1.default.writeFile(keyPath, '', 'utf8');
                    }
                    catch (error) {
                        console_api_1.default.Error("main", `Error processing save data: ${error}`);
                        // Продолжаем выполнение, т.к. пароль уже изменен
                    }
                }
            }
        }
        catch (error) {
            console_api_1.default.Error("main", `Error accessing key file: ${error}`);
            // Продолжаем выполнение, т.к. пароль уже изменен
        }
        console_api_1.default.Log("main", `Panel action: changed password in account ${userName}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changePassword`);
        return "-2"; // Общая ошибка
    }
};
exports.default = changePassword;
