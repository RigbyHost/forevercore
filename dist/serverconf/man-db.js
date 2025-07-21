"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dbPools = {};
const manDB = {
    createConnection: async (id) => {
        /*if (id !== "MANDB_PROCESS") {
            return false;
        }*/
        if (!dbPools[id]) {
            const config = {
                host: "95.174.92.175", // or else
                user: "forever-db",
                password: "1NFDurF137",
                database: "forever-db",
                port: 3306
            };
            dbPools[id] = promise_1.default.createPool({
                ...config,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
        }
        return dbPools[id];
    }
};
exports.default = manDB;
