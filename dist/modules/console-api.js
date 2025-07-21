'package net.fimastgd.forevercore.modules.console-api';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const c = __importStar(require("ansi-colors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const minimist_1 = __importDefault(require("minimist"));
// Parse command line arguments
const args = (0, minimist_1.default)(process.argv.slice(2));
let timeformat = "Unknown";
if (args.time === 'msc') {
    timeformat = 3;
}
else if (args.time === 'def') {
    timeformat = 0;
}
else {
    timeformat = "Unknown";
}
/**
 * Time format utility function for log files
 */
function dateFile() {
    const currentDate = new Date();
    let fDate;
    if (timeformat === 3) {
        currentDate.setHours(currentDate.getHours() + 3);
        fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
    }
    else if (timeformat === 0) {
        fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
    }
    else {
        ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
        process.exit(1);
        fDate = ''; // Unreachable but needed for TypeScript
    }
    return fDate;
}
/**
 * Time format utility function for log messages
 */
function dateNow() {
    const currentDate = new Date();
    let fDate;
    if (timeformat === 3) {
        currentDate.setHours(currentDate.getHours() + 3);
        fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
    }
    else if (timeformat === 0) {
        fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
    }
    else {
        ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
        process.exit(1);
        fDate = ''; // Unreachable but needed for TypeScript
    }
    return fDate;
}
/**
 * Delete old log files older than 7 days
 */
function deleteOldLogs() {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    const now = new Date();
    fs.readdirSync(logsDir).forEach(file => {
        const filePath = path.join(logsDir, file);
        const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
        const match = file.match(datePattern);
        if (match) {
            const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
            const fileDate = new Date(year, month, day);
            const diffDays = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 7) {
                fs.unlinkSync(filePath);
                const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
                console.log(SENDtemp);
            }
        }
    });
}
/**
 * Console API for logging and console management
 */
class ConsoleApi {
    /**
     * Writes a raw message to console and/or log file
     * @param args - Message content
     * @param logsave - Whether to save to log file
     * @param sendIn - Whether to print to console
     */
    static Write(args, logsave = true, sendIn = true) {
        deleteOldLogs();
        const SEND = `${args}`;
        if (sendIn) {
            console.log(SEND);
        }
        if (logsave === true) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs a debug message
     * @param thread - Thread name
     * @param args - Debug message
     * @param logsave - Whether to save to log file
     */
    static Debug(thread, args, logsave = true) {
        deleteOldLogs();
        const SEND = `[${dateNow()}] [${thread}/DEBUG]: ${args}`;
        console.log(SEND);
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs an info message
     * @param thread - Thread name
     * @param args - Info message
     * @param logsave - Whether to save to log file
     */
    static Log(thread, args, logsave = true) {
        deleteOldLogs();
        const SEND = `[${dateNow()}] [${thread}/INFO]: ${args}`;
        console.log(SEND);
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs a warning message
     * @param thread - Thread name
     * @param args - Warning message
     * @param logsave - Whether to save to log file
     */
    static Warn(thread, args, logsave = true) {
        deleteOldLogs();
        const SEND = `[${dateNow()}] [${thread}/WARN]: ${args}`;
        console.warn(c.yellowBright(SEND));
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs an error message
     * @param thread - Thread name
     * @param args - Error message
     * @param logsave - Whether to save to log file
     */
    static Error(thread, args, logsave = true) {
        deleteOldLogs();
        const SEND = `[${dateNow()}] [${thread}/ERROR]: ${args}`;
        console.log(c.redBright(SEND));
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs a fatal error message
     * @param thread - Thread name
     * @param args - Fatal error message
     * @param logsave - Whether to save to log file
     */
    static FatalError(thread, args, logsave = true) {
        let ESFORCE = false;
        if (timeformat === 3) {
            ESFORCE = false;
        }
        else if (timeformat === 0) {
            ESFORCE = false;
        }
        else {
            ESFORCE = true;
        }
        deleteOldLogs();
        let SEND;
        if (ESFORCE === false) {
            SEND = `[${dateNow()}] [${thread}/FATAL ERROR]: ${args}`;
        }
        else {
            SEND = `[${dateNow()}-UTC] [${thread}/FATAL ERROR]: ${args}`;
        }
        console.log(c.redBright(SEND));
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
    /**
     * Logs an info message with light green color
     * @param thread - Thread name
     * @param args - Info message
     * @param logsave - Whether to save to log file
     */
    static Log$LightGreen(thread, args, logsave = true) {
        deleteOldLogs();
        const SEND = `[${dateNow()}] [${thread}/INFO]: ${args}`;
        console.log(c.greenBright(SEND));
        if (logsave) {
            const LOGFILE = `${dateFile()}.log`;
            const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
            fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
            const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
            fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
        }
    }
}
exports.default = ConsoleApi;
