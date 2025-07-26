"package net.fimastgd.forevercore";

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import readline from "readline";
import * as c from "ansi-colors";
import minimist from "minimist";

import threadConnection from "@/serverconf/db";
import { getSettings } from "@/serverconf/settings";
import envConfig from "@/serverconf/env-config";
import ConsoleApi from "@/modules/console-api";
import ApiRouter from "@/routes/api-router";
import { createAllHandlers } from "@/routes/handlers";
import TS_handler from "@/tslib/TS_handler";
import { Roles } from "@/panel/roles/roles";
import { createProxyMiddleware } from "http-proxy-middleware";
import RedisController from "@RedisController";

// Parse command line arguments
const args = minimist(process.argv.slice(2));
const NOGUI = args.nogui || args["--nogui"] || false;
let versionSwitcher: boolean = false;
if (args.versionSwitcher && args.versionSwitcher === "basic") {
	async function checkVersionSwitcher(): Promise<null> {
		try {
			await fs.promises.access(path.join(__dirname, "VersionSwitcher.jsc"));
			versionSwitcher = true;
			return null;
		} catch (IOException) {
			ConsoleApi.Warn(
				"VersionSwitcher",
				"Could not find or load class VersionSwitcher from net.fimastgd.forevercore.VersionSwitcher at net.fimastgd.forevercore"
			);
			return null;
		}
	}
	checkVersionSwitcher();
} else {
	ConsoleApi.Warn("VersionSwitcher", "VersionSwitcher is disabled, there may be problems when starting in production");
}

// Clear log files
const clearLatest = (): void => {
	const pathlatest = path.join(__dirname, "logs", "latest.log");
	fs.writeFileSync(pathlatest, "", "utf-8");
};

const clearStreamLog = (): void => {
	const pathstream = path.join(__dirname, "logs", "stream.log");
	fs.writeFileSync(pathstream, "", "utf-8");
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
ConsoleApi.Log("Server thread", "Using package net.fimastgd.forevercore", true);

// Initialize TypeScript components
TS_handler().catch(error => {
	ConsoleApi.FatalError("Server thread", `Failed to initialize TypeScript components: ${error}`);
	process.exit(1);
});

// Create Express app
const app = express();

// Configure middleware
app.set("view engine", "ejs");
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Логгирование всех запросов для отладки
app.use((req, res, next) => {
	ConsoleApi.Log("Request", `${req.method} ${req.url}`);
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
ConsoleApi.Log("Routes Check", `panelMain: ${typeof panelMain}`);

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
const apiRouter = new ApiRouter();
const handlers = createAllHandlers();
apiRouter.registerHandlers(handlers);

// Apply API routes - must be after all other routes
app.use("/", apiRouter.initialize());

// Add home page route

app.get("/", (req, res) => {
	res.send("ForeverHost GDPS");
});

// Логгирование 404 ошибок
app.use((req, res, next) => {
	ConsoleApi.Error("404 Handler", `Запрос на несуществующий путь: ${req.method} ${req.originalUrl}`);
	next();
});

// Add 404 error handler
app.use((req, res) => {
	res.status(404).render("errors/404", { url: req.originalUrl });
});

// Log environment configuration in development
if (envConfig.isDevelopment()) {
	envConfig.logConfiguration();
}

// Redis connection
const checkRedis = async (): Promise<true | string> => {
	try {
		const redis = new RedisController({
			host: envConfig.get("REDIS_HOST"),
			port: envConfig.get("REDIS_PORT"),
			keyPrefix: envConfig.get("REDIS_NAMESPACE"),
			password: envConfig.get("REDIS_PASSWORD")
		});
		const PING: string = await redis.ping();
		if (PING === "PONG") {
			return true;
		} else {
			return PING;
		}
	} catch (e) {
		ConsoleApi.FatalError("main", "Failed to handle redis connection: " + e + " at net.fimastgd.forevercore");
		process.exit(1);
		return "RedisException*";
	}
};

// Start server
const PORT = envConfig.get("PORT");

app.listen(PORT, () => {
	ConsoleApi.Log$LightGreen("main", `GDPS Engine started on port ${PORT}!`);
	if (envConfig.get("REDIS_ENABLED")) {
		ConsoleApi.Log("RedisController", "Redis is enabled on this node");
		checkRedis()
			.then(val => {
				if (String(val) == "true") {
					ConsoleApi.Log("main", "Successful connection to Redis");
				} else {
					ConsoleApi.Error("main", "Failed to connect to Redis. Check the .env configuration for mistakes");
				}
			})
			.catch(() => {
				process.exit(1);
			});
	}
	// Setup command line interface if not in NOGUI mode
	if (!NOGUI) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.on("line", async input => {
			const command = input.trim();

			if (command === "stop") {
				ConsoleApi.Write("> stop", true, false);
				ConsoleApi.Log("main", "Stopping server...");
				ConsoleApi.Log("Server thread", "----- [ SERVER STOPPED ] -----");
				process.exit(0);
			} else if (command.trim() === "") {
				// Do nothing for empty command
			} else {
				ConsoleApi.Write(`> ${command}`, true, false);
				ConsoleApi.Error("Line thread", `Unknown command "${command}" loaded in main thread at net.fimastgd.forevercore`);
			}
		});
	}
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
	ConsoleApi.Log("main", "Received SIGINT signal, shutting down gracefully...");
	ConsoleApi.Log("main", "Stopping server...");
	ConsoleApi.Log("Server thread", "----- [ SERVER STOPPED ] -----");
	process.exit(0);
});

process.on("SIGTERM", async () => {
	ConsoleApi.Log("main", "Received SIGTERM signal, shutting down gracefully...");
	ConsoleApi.Log("main", "Stopping server...");
	ConsoleApi.Log("Server thread", "----- [ SERVER STOPPED ] -----");
	process.exit(0);
});
