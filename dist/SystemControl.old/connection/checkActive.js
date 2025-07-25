'package net.fimastgd.forevercore.SystemControl.connection.checkActive';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActive = checkActive;
const man_db_1 = __importDefault(require("../../serverconf/man-db"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
async function checkActive(id, node) {
    try {
        // Подключение к центральному реестру
        const mandb = await man_db_1.default.createConnection("MANDB_PROCESS");
        // Получение ячейки state
        const [rows] = await mandb.execute(`SELECT state FROM servers WHERE serverID = ? AND node = ?`, [id, node]);
        // Получение JSON
        let result = rows[0].state;
        // Парсинг JSON в объект
        const props = JSON.parse(result);
        // Установка isActive на true если GDPS активен, на false если нет
        let isActive = Boolean(props.active);
        // возвращаем Promise<boolean>
        return isActive;
    }
    catch (e) {
        console_api_1.default.Error("SystemControl", `${e} at net.fimastgd.forevercore.SystemControl.SystemControl.connection.checkActive`);
        return false;
    }
}
