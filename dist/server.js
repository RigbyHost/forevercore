"package net.fimastgd.forevercore";
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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const c = __importStar(require("ansi-colors"));
const minimist_1 = __importDefault(require("minimist"));
const env_config_1 = __importDefault(require("./serverconf/env-config"));
const console_api_1 = __importDefault(require("./modules/console-api"));
const api_router_1 = __importDefault(require("./routes/api-router"));
const handlers_1 = require("./routes/handlers");
const TS_handler_1 = __importDefault(require("./tslib/TS_handler"));
// Parse command line arguments
const args = (0, minimist_1.default)(process.argv.slice(2));
const NOGUI = args.nogui || args["--nogui"] || false;
let versionSwitcher = false;
if (args.versionSwitcher && args.versionSwitcher === "basic") {
    async function checkVersionSwitcher() {
        try {
            await fs_1.default.promises.access(path_1.default.join(__dirname, 'VersionSwitcher.jsc'));
            versionSwitcher = true;
            return null;
        }
        catch (IOException) {
            console_api_1.default.Warn("VersionSwitcher", "Could not find or load class VersionSwitcher from net.fimastgd.forevercore.VersionSwitcher at net.fimastgd.forevercore");
            return null;
        }
    }
    checkVersionSwitcher();
}
else {
    console_api_1.default.Warn("VersionSwitcher", "VersionSwitcher is disabled, there may be problems when starting in production");
}
// Clear log files
const clearLatest = () => {
    const pathlatest = path_1.default.join(__dirname, "logs", "latest.log");
    fs_1.default.writeFileSync(pathlatest, "", "utf-8");
};
const clearStreamLog = () => {
    const pathstream = path_1.default.join(__dirname, "logs", "stream.log");
    fs_1.default.writeFileSync(pathstream, "", "utf-8");
};
// Show warning for NOGUI mode
if (NOGUI) {
    console.log("\n " + c.bgYellow("                                              "));
    console.log(" " + c.bgYellow.black(" Будьте осторожны, риск несохранения данных:  "));
    console.log(" " + c.bgYellow.black(" Флаг --nogui используйте только в production "));
    console.log(" " + c.bgYellow("                                              \n"));
}
// Clear logs
clearLatest();
clearStreamLog();
console_api_1.default.Log("Server thread", "Using package net.fimastgd.forevercore", true);
// Initialize TypeScript components
(0, TS_handler_1.default)().catch(error => {
    console_api_1.default.FatalError("Server thread", `Failed to initialize TypeScript components: ${error}`);
    process.exit(1);
});
// Create Express app
const app = (0, express_1.default)();
// Configure middleware
app.set("view engine", "ejs");
app.use((0, cors_1.default)());
app.use(express_1.default.static("public"));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
// Логгирование всех запросов для отладки
app.use((req, res, next) => {
    console_api_1.default.Log("Request", `${req.method} ${req.url}`);
    next();
});
// Import route modules
const panelMain = require("./routes/panel/main");
const panelAccounts = require("./routes/panel/accounts");
const panelMusic = require("./routes/panel/music").default;
const panelLists = require("./routes/panel/lists").default;
const panelLeaderboard = require("./routes/panel/leaderboard").default;
const panelPacks = require("./routes/panel/packs").default;
const panelRoles = require("./routes/panel/roles").default;
// Проверка модулей маршрутов
console_api_1.default.Log("Routes Check", `panelMain: ${typeof panelMain}`);
// Обработка для случая, если модули импортированы с .default
const getPanelMainRouter = () => {
    if (panelMain && typeof panelMain === "object" && panelMain.default) {
        return panelMain.default;
    }
    return panelMain;
};
// Register base routes first, then more specific routes
app.use("/:gdpsid/panel", getPanelMainRouter());
// Register specific panel routes
app.use("/:gdpsid/panel/accounts", panelAccounts);
app.use("/:gdpsid/panel/music", panelMusic);
app.use("/:gdpsid/panel/lists", panelLists);
app.use("/:gdpsid/panel/leaderboard", panelLeaderboard);
app.use("/:gdpsid/panel/packs", panelPacks);
app.use("/:gdpsid/panel/roles", panelRoles);
// Register command route
// app.use("/cmd", cmd);
// Create and configure API Router
const apiRouter = new api_router_1.default();
const handlers = (0, handlers_1.createAllHandlers)();
apiRouter.registerHandlers(handlers);
// Apply API routes - must be after all other routes
app.use("/", apiRouter.initialize());
// Add home page route
app.get("/", (req, res) => {
    res.send("ForeverHost GDPS");
});
// Логгирование 404 ошибок
app.use((req, res, next) => {
    console_api_1.default.Error("404 Handler", `Запрос на несуществующий путь: ${req.method} ${req.originalUrl}`);
    next();
});
// Add 404 error handler
app.use((req, res) => {
    res.status(404).render("errors/404", { url: req.originalUrl });
});
// Log environment configuration in development
if (env_config_1.default.isDevelopment()) {
    env_config_1.default.logConfiguration();
}
// Start server
const PORT = env_config_1.default.get('PORT');
app.listen(PORT, () => {
    console_api_1.default.Log$LightGreen("main", `GDPS Engine started on port ${PORT}!`);
    // Setup command line interface if not in NOGUI mode
    if (!NOGUI) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on("line", async (input) => {
            const command = input.trim();
            if (command === "stop") {
                console_api_1.default.Write("> stop", true, false);
                console_api_1.default.Log("main", "Stopping server...");
                console_api_1.default.Log("Server thread", "----- [ SERVER STOPPED ] -----");
                process.exit(0);
            }
            else if (command === "") {
                // Do nothing for empty command
            }
            else {
                console_api_1.default.Write(`> ${command}`, true, false);
                console_api_1.default.Error("Line thread", `Unknown command "${command}" loaded in main thread at net.fimastgd.forevercore`);
            }
        });
    }
});
// Handle graceful shutdown
process.on("SIGINT", async () => {
    console_api_1.default.Log("main", "Received SIGINT signal, shutting down gracefully...");
    console_api_1.default.Log("main", "Stopping server...");
    console_api_1.default.Log("Server thread", "----- [ SERVER STOPPED ] -----");
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console_api_1.default.Log("main", "Received SIGTERM signal, shutting down gracefully...");
    console_api_1.default.Log("main", "Stopping server...");
    console_api_1.default.Log("Server thread", "----- [ SERVER STOPPED ] -----");
    process.exit(0);
});
