"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const db_1 = __importDefault(require("../../serverconf/db"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const generatePass_1 = __importDefault(require("../lib/generatePass"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const settings_1 = require("../../serverconf/settings");
/**
 * Бэкапит аккаунт Geometry Dash в базу данных и на диск
 * @param gdpsid - ID GDPS
 * @param userNameOr - Имя пользователя
 * @param passwordOr - Пароль
 * @param saveDataOr - Данные сохранения
 * @param accountIDOr - ID аккаунта
 * @param gjp2Or - GJP2 хеш
 * @param req - Express запрос
 * @returns "1" если успешно, "-1" если ошибка
 */
const backupAccount = async (gdpsid, userNameOr, passwordOr, saveDataOr, accountIDOr, gjp2Or, req) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        // Логируем запрос
        console_api_1.default.Log("main", `Backup request received for account ${accountIDOr || userNameOr}`);
        // Базовая валидация входных данных
        if (!saveDataOr || (!userNameOr && !accountIDOr)) {
            console_api_1.default.Error("main", `Failed to backup account: missing required parameters`);
            return "-1";
        }
        // Получить имя пользователя, если не предоставлено
        let userName = null;
        let accountID = null;
        // Получение accountID и userName
        try {
            if (!userNameOr) {
                accountID = await exploitPatch_1.default.remove(accountIDOr);
                const [rows] = await db.execute("SELECT userName FROM accounts WHERE accountID = ?", [accountID]);
                userName = rows.length ? rows[0].userName : null;
            }
            else {
                userName = await exploitPatch_1.default.remove(userNameOr);
                if (!accountIDOr) {
                    const [rows] = await db.execute("SELECT accountID FROM accounts WHERE userName = ?", [userName]);
                    accountID = rows.length ? rows[0].accountID : null;
                }
                else {
                    accountID = exploitPatch_1.default.remove(accountIDOr);
                }
            }
            // Проверить ID аккаунта
            if (!accountID || !isFinite(Number(accountID))) {
                console_api_1.default.Log("main", `Failed to backup account: ${accountID} - invalid ID`);
                return "-1";
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error getting account info: ${err}`);
            return "-1";
        }
        // Проверить пароль
        let pass = 0;
        try {
            if (passwordOr) {
                pass = await generatePass_1.default.isValid(accountID, passwordOr, req);
            }
            else if (gjp2Or) {
                pass = await generatePass_1.default.isGJP2Valid(accountID, gjp2Or, req);
            }
            if (pass !== 1) {
                console_api_1.default.Log("main", `Failed to backup account. ID: ${accountID} - authentication failed`);
                return "-1";
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error in authentication: ${err}`);
            return "-1";
        }
        // Обработка данных сохранения
        let saveDataArr = [];
        let saveDataDecoded = "";
        let orbs = "0";
        let lvls = "0";
        try {
            saveDataArr = saveDataOr.split(";");
            saveDataDecoded = Buffer.from(saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
            // Извлечь сферы и уровни из данных сохранения
            const saveDataParsed = {
                orbs: "0",
                levels: "0"
            };
            // Безопасно извлекаем данные
            const orbsMatch = saveDataDecoded.match(/<k>14<\/k><s>([^<]+)<\/s>/);
            if (orbsMatch && orbsMatch[1]) {
                saveDataParsed.orbs = orbsMatch[1];
            }
            const lvlsMatch = saveDataDecoded.match(/<k>GS_value<\/k>.*?<k>4<\/k><s>([^<]+)<\/s>/);
            if (lvlsMatch && lvlsMatch[1]) {
                saveDataParsed.levels = lvlsMatch[1];
            }
            orbs = saveDataParsed.orbs;
            lvls = saveDataParsed.levels;
            // Маскировать пароль в данных сохранения
            if (passwordOr) {
                saveDataDecoded = saveDataDecoded.replace(new RegExp(`<k>GJA_002</k><s>${passwordOr}</s>`, "g"), "<k>GJA_002</k><s>password</s>");
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error parsing save data: ${err}`);
            // Продолжаем выполнение с дефолтными значениями
        }
        // Сохранить данные в БД
        try {
            const query = `UPDATE accounts SET saveData = ?, lastBackup = ? WHERE accountID = ?`;
            await db.execute(query, [saveDataOr, Math.floor(Date.now() / 1000), accountID]);
        }
        catch (err) {
            console_api_1.default.Error("main", `Error updating account data in DB: ${err}`);
            return "-1";
        }
        // Обновить статистику пользователя (сферы и уровни)
        try {
            if (userNameOr) {
                const [rows] = await db.execute("SELECT extID FROM users WHERE userName = ? LIMIT 1", [userNameOr]);
                if (rows.length > 0) {
                    const extID = rows[0].extID;
                    await db.execute("UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE extID = ?", [orbs, lvls, extID]);
                }
            }
            else {
                const [rows] = await db.execute("SELECT userName FROM users WHERE extID = ? LIMIT 1", [accountID]);
                if (rows.length > 0) {
                    const userNameFin = rows[0].userName;
                    await db.execute("UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE userName = ?", [orbs, lvls, userNameFin]);
                }
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error updating user stats: ${err}`);
            // Продолжаем даже если не удалось обновить статистику
        }
        // Сохранить данные на диск
        try {
            // Создать директорию для бэкапов, если не существует
            const backupDir = path_1.default.join(__dirname, "..", "..", "data", "backups");
            await promises_1.default.mkdir(backupDir, { recursive: true });
            // Создать поддиректорию для пользователя
            const userBackupDir = path_1.default.join(backupDir, `${accountID}`);
            await promises_1.default.mkdir(userBackupDir, { recursive: true });
            // Сохранить данные
            const timestamp = Math.floor(Date.now() / 1000);
            const backupFile = path_1.default.join(userBackupDir, `backup_${timestamp}.dat`);
            // Сохраняем исходные данные
            await promises_1.default.writeFile(backupFile, saveDataOr);
            // Сохраняем декодированные данные для отладки
            const decodedBackupFile = path_1.default.join(userBackupDir, `backup_decoded_${timestamp}.dat`);
            await promises_1.default.writeFile(decodedBackupFile, saveDataDecoded);
            // Удаляем старые бэкапы, если превышено максимальное количество
            /// <summary>
            ///     Нахера это, можно вопрос? Ну то есть хватит и перезаписи одного бэкапа
            /// </summary>
            const settings = await (0, settings_1.getSettings)(gdpsid);
            const MAX_BACKUPS = settings.maxAccountBackups || 5;
            const files = await promises_1.default.readdir(userBackupDir);
            // Фильтруем только файлы формата backup_*.dat
            const backupFiles = files
                .filter(file => file.match(/^backup_\d+\.dat$/))
                .map(file => ({
                name: file,
                path: path_1.default.join(userBackupDir, file),
                time: parseInt(file.replace("backup_", "").replace(".dat", ""))
            }))
                .sort((a, b) => b.time - a.time); // Сортируем по времени (самые новые первые)
            // Удаляем все бэкапы после максимального допустимого количества
            if (backupFiles.length > MAX_BACKUPS) {
                for (let i = MAX_BACKUPS; i < backupFiles.length; i++) {
                    await promises_1.default.unlink(backupFiles[i].path);
                }
            }
        }
        catch (err) {
            console_api_1.default.Error("main", `Error saving backup to disk: ${err}`);
            // Не прерываем выполнение, так как данные уже сохранены в БД
        }
        console_api_1.default.Log("main", `Account backed up successfully. ID: ${accountID}`);
        return "1";
    }
    catch (err) {
        console_api_1.default.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.backup`);
        return "-1";
    }
};
exports.default = backupAccount;
