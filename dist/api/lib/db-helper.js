"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultDb = getDefaultDb;
const db_1 = __importDefault(require("../../serverconf/db"));
// Temporary helper to get database connection with default GDPS ID
// TODO: This should be refactored to get gdpsid from request context
async function getDefaultDb() {
    return await (0, db_1.default)('main');
}
