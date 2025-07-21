"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
// Temporary proxy for backward compatibility
// This creates a singleton connection for the default GDPS
// TODO: This should be refactored to properly handle multiple GDPS instances
let defaultConnection = null;
async function getConnection() {
    if (!defaultConnection) {
        defaultConnection = await (0, db_1.default)('main');
    }
    return defaultConnection;
}
// Export a proxy object that mimics the old db interface
const dbProxy = {
    async execute(sql, values) {
        const conn = await getConnection();
        return conn.execute(sql, values);
    },
    async query(sql, values) {
        const conn = await getConnection();
        return conn.query(sql, values);
    }
};
exports.default = dbProxy;
