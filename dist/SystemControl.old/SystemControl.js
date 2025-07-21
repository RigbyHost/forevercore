'package net.fimastgd.forevercore.SystemControl.SystemControl';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemControl = void 0;
const checkOnlineMode_1 = __importDefault(require("./checkOnlineMode"));
const checkGDPS_1 = require("./validation/checkGDPS");
const expired_1 = require("./validation/expired");
const checkActive_1 = require("./connection/checkActive");
class SystemControl {
}
exports.SystemControl = SystemControl;
SystemControl.validation = class {
    /** Проверяет, существует ли GDPS в реестре
     * @param id - GDPS ID
     * @param node - GDPS node
     * @returns true (GDPS существует) / false (GDPS не существует)
    */
    static async checkGDPS(id, node) {
        if ((0, checkOnlineMode_1.default)()) {
            const result = await (0, checkGDPS_1.checkGDPS)(id, node);
            return result;
        }
        else {
            return true; // пиратский режим для одиночных GDPS на самохосте
        }
    }
    /** Проверяет, просрочен ли GDPS
     * @param id - GDPS ID
     * @param node - GDPS node
     * @returns true (GDPS просрочен) / false (GDPS действителен)
    */
    static async expired(id, node) {
        if ((0, checkOnlineMode_1.default)()) {
            const result = await (0, expired_1.expired)(id, node);
            return result;
        }
        else {
            return false;
        }
    }
};
SystemControl.connection = class {
    /** Проверяет статус GDPS
     * @param id - GDPS ID
     * @param node - GDOS node
     * @returns true (GDPS активен) / false (GDPS выключен)
     */
    static async checkActive(id, node) {
        if ((0, checkOnlineMode_1.default)()) {
            const result = await (0, checkActive_1.checkActive)(id, node);
            return result;
        }
        else {
            return false;
        }
    }
};
