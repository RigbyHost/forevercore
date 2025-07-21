"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dbThread_1 = __importDefault(require("./dbThread"));
const env_config_1 = __importDefault(require("./env-config"));
const dbPools = {};
async function threadConnection(id) {
    if (!dbPools[id]) {
        const config = (0, dbThread_1.default)(id);
        dbPools[id] = promise_1.default.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: env_config_1.default.get('DB_CONNECTION_LIMIT'),
            queueLimit: 0
        });
    }
    return dbPools[id];
}
exports.default = threadConnection;
