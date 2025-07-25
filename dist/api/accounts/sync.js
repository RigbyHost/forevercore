"package net.fimastgd.forevercore.api.accounts.sync";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const db_1 = __importDefault(require("../../serverconf/db"));
const generatePass_1 = __importDefault(require("../lib/generatePass"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
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
const syncAccount = async (gdpsid, userNameStr, accountIDStr, passwordStr, gjp2Str, req) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        // Логируем запрос
        console_api_1.default.Log("main", `Sync request received for account ${accountIDStr || userNameStr}`);
        // Базовая валидация входных данных
        if (!userNameStr && !accountIDStr) {
            console_api_1.default.Error("main", `Failed to sync account: missing required parameters`);
            return "-1";
        }
        const password = passwordStr || "";
        let accountID = accountIDStr || "";
        // Получить ID аккаунта по имени пользователя, если не предоставлен
        if (!accountID) {
            try {
                const userName = await exploitPatch_1.default.remove(userNameStr);
                const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
                accountID = rows.length ? rows[0].accountID.toString() : null;
                if (!accountID) {
                    console_api_1.default.Log("main", `Failed to sync account: account not found`);
                    return "-1";
                }
            }
            catch (err) {
                console_api_1.default.Error("main", `Error getting account ID: ${err}`);
                return "-1";
            }
        }
        else {
            accountID = await exploitPatch_1.default.remove(accountIDStr);
        }
        // Проверить учетные данные
        let pass = 0;
        try {
            if (passwordStr) {
                pass = await generatePass_1.default.isValid(accountID, passwordStr, req);
            }
            else if (gjp2Str) {
                pass = await generatePass_1.default.isGJP2Valid(accountID, gjp2Str, req);
            }
            if (pass !== 1) {
                console_api_1.default.Log("main", `Failed to sync account: ${accountID} - authentication failed`);
                return "-2";
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error in authentication: ${err}`);
            return "-1";
        }
        // Получить данные сохранения
        let saveData = "";
        // Сначала проверим наличие файла последнего бэкапа на диске
        try {
            const backupDir = path_1.default.join(__dirname, "..", "..", "data", "backups", `${accountID}`);
            // Проверяем существование директории
            try {
                await promises_1.default.access(backupDir);
            }
            catch (err) {
                // Директория не существует, используем данные из БД
                throw new Error("Backup directory does not exist");
            }
            // Получаем список файлов бэкапов
            const files = await promises_1.default.readdir(backupDir);
            // Фильтруем только файлы формата backup_*.dat
            const backupFiles = files
                .filter(file => file.match(/^backup_\d+\.dat$/))
                .map(file => ({
                name: file,
                path: path_1.default.join(backupDir, file),
                time: parseInt(file.replace("backup_", "").replace(".dat", ""))
            }))
                .sort((a, b) => b.time - a.time); // Сортируем по времени (самые новые первые)
            // Если есть бэкапы, используем самый свежий
            if (backupFiles.length > 0) {
                saveData = await promises_1.default.readFile(backupFiles[0].path, "utf8");
            }
            else {
                throw new Error("No backup files found");
            }
        }
        catch (err) {
            // Если возникла ошибка с файлами, используем данные из БД
            console_api_1.default.Log("main", `No backup files found on disk, using DB: ${err}`);
            try {
                const [rows] = await db.execute("SELECT saveData FROM accounts WHERE accountID = ?", [accountID]);
                if (rows.length === 0 || !rows[0].saveData) {
                    console_api_1.default.Log("main", `Failed to sync account ${accountID}: no save data found`);
                    return "-1";
                }
                saveData = rows[0].saveData;
            }
            catch (dbErr) {
                console_api_1.default.Error("main", `Error getting save data from DB: ${dbErr}`);
                return "-1";
            }
        }
        // Обновить время последней синхронизации
        try {
            await db.execute("UPDATE accounts SET lastSync = ? WHERE accountID = ?", [Math.floor(Date.now() / 1000), accountID]);
        }
        catch (err) {
            console_api_1.default.Error("main", `Error updating lastSync time: ${err}`);
            // Продолжаем выполнение, так как основная задача - вернуть данные сохранения
        }
        console_api_1.default.Log("main", `Synced account: ${accountID}`);
        // Возвращаем данные в нужном формате
        return `${saveData};21;30;a;a`;
    }
    catch (error) {
        console_api_1.default.Warn("main", `Check the data for damage at net.fimastgd.forevercore.api.accounts.sync`);
        console_api_1.default.Error("main", `Unhandled server exception with user sync account: ${error}`);
        return "-1";
    }
};
exports.default = syncAccount;
