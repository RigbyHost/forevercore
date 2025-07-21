'package net.fimastgd.forevercore.SystemControl.validation.expired';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expired = expired;
const man_db_1 = __importDefault(require("../../serverconf/man-db"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
async function expired(id, node) {
    try {
        // Подключение к базе данных
        const mandb = await man_db_1.default.createConnection("MANDB_PROCESS");
        // Выполнение запроса для получения строки
        const [rows] = await mandb.execute(`SELECT dates FROM servers
				WHERE serverID = ? AND node = ?`, [id, node]);
        // Проверка, есть ли данные
        if (rows.length === 0) {
            console_api_1.default.Warn("SystemControl", `String with serverID = ${id} and node = ${node} not found at net.fimastgd.forevercore.SystemControl.validation.expired`);
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
        }
        else {
            // GDPS действителен
            return false;
        }
    }
    catch (e) {
        console_api_1.default.Error("SystemControl", `${e.message} at net.fimastgd.forevercore.SystemControl.validation.expired`);
        return true;
    }
}
