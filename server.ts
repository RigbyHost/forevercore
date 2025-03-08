'package net.fimastgd.forevercore';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import * as c from 'ansi-colors';
import minimist from 'minimist';

import db from './serverconf/db';
import { settings } from './serverconf/settings';
import ConsoleApi from './modules/console-api';
import ApiRouter from './routes/api-router';
import { createAllHandlers } from './routes/handlers';
import TS_handler from './tslib/TS_handler';
import { Roles } from './panel/roles/roles';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Parse command line arguments
const args = minimist(process.argv.slice(2));
const NOGUI = args.nogui || args['--nogui'] || false;

// Clear log files
const clearLatest = (): void => {
	const pathlatest = path.join(__dirname, 'logs', 'latest.log');
	fs.writeFileSync(pathlatest, '', 'utf-8');
};

const clearStreamLog = (): void => {
	const pathstream = path.join(__dirname, 'logs', 'stream.log');
	fs.writeFileSync(pathstream, '', 'utf-8');
};

// Show warning for NOGUI mode
if (NOGUI) {
	console.log('\n ' + c.bgYellow('                                              '));
	console.log(' ' + c.bgYellow.black(' Будьте осторожны, риск несохранения данных:  '));
	console.log(' ' + c.bgYellow.black(' Флаг --nogui используйте только в production '));
	console.log(' ' + c.bgYellow('                                              \n'));
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

// Import route modules
const panelAccounts = require('./routes/panel/accounts');
const panelMain = require('./routes/panel/main');
const panelMusic = require('./routes/panel/music').default;
const panelLists = require('./routes/panel/lists').default;
const panelLeaderboard = require('./routes/panel/leaderboard').default;
const panelPacks = require('./routes/panel/packs').default;
const panelRoles = require('./routes/panel/roles').default;
const cmd = require('./routes/cmd/cmd').default;
const serverlife = require('./routes/serverlife').default;

// Register panel routes
app.use('/panel/accounts', panelAccounts);
app.use('/panel', panelMain);
app.use('/panel/music', panelMusic);
app.use('/panel/lists', panelLists);
app.use('/panel/leaderboard', panelLeaderboard);
app.use('/panel/packs', panelPacks);
app.use('/panel/roles', panelRoles);
app.use('/cmd', cmd);
app.use('/serverlife', serverlife);

// Create and configure API Router
const apiRouter = new ApiRouter();
const handlers = createAllHandlers();
apiRouter.registerHandlers(handlers);

// Apply API routes
app.use('/', apiRouter.initialize());

// Load plugins
const loadPlugins = (): void => {
	const pluginsDir = path.join(__dirname, 'plugins');

	if (!fs.existsSync(pluginsDir)) {
		fs.mkdirSync(pluginsDir, { recursive: true });
	}

	fs.readdirSync(pluginsDir).forEach(file => {
		const pluginPath = path.join(pluginsDir, file);

		try {
			const plugin = require(pluginPath);

			if (typeof plugin === 'function') {
				plugin(app);
				ConsoleApi.Log("Anvil PluginLoader", `Plugin ${file} loaded successfully.`);
			} else {
				ConsoleApi.Error("Anvil PluginLoader", `Plugin ${file} is not a correct plugin function, loading ignored.`);
			}
		} catch (error) {
			ConsoleApi.FatalError("Anvil PluginLoader", `Error loading plugin ${file}: ${error}`);
		}
	});
};

// Load plugins
loadPlugins();

// Add home page route
const GDPSID = settings.GDPSID.replace(/\//g, "");

if (GDPSID !== "") {
	app.get(`/${GDPSID}`, (req, res) => {
		res.send("ForeverCore GDPS Server");
	});
}

app.get("/", (req, res) => {
	res.send("ForeverCore GDPS Server");
});

app.use((req, res, next) => {
	ConsoleApi.Error("404 Handler", `Запрос на несуществующий путь: ${req.method} ${req.originalUrl}`);
	next();
});

// Add 404 error handler
app.use((req, res) => {
	res.status(404).render('errors/404', { url: req.originalUrl });
});

// Start server
const PORT = settings.PORT;

app.listen(PORT, () => {
	ConsoleApi.Log$LightGreen("main", `GDPS Engine started on port ${PORT}!`);

	// Setup command line interface if not in NOGUI mode
	if (!NOGUI) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.on('line', async (input) => {
			const command = input.trim();

			if (command === 'stop') {
				ConsoleApi.Write("> stop", true, false);
				ConsoleApi.Log('FLS system', "Saving level chunks... [ IN FUTURE ]");
				ConsoleApi.Log('FLS system', "Saving account chunks... [ IN FUTURE ]");
				ConsoleApi.Log('main', "Stopping database server...");
				await db.end();
				ConsoleApi.Log('main', "Stopping server...");
				ConsoleApi.Log('Server thread', "----- [ SERVER STOPPED ] -----");
				process.exit(0);
			} else if (command.split(' ')[0] === 'op') {
				ConsoleApi.Write(`> ${command}`, true, false);
				const roles = new Roles();
				const username = command.split(' ')[1];

				if (!username) {
					ConsoleApi.Error("main", "Usage: op <username>");
					return;
				}

				try {
					const success = await roles.setRole(username, 1);

					if (success) {
						ConsoleApi.Log("main", `${username} opped`);
					} else {
						ConsoleApi.Error("main", `Failed to op ${username}`);
					}
				} catch (error) {
					ConsoleApi.Error("main", `Error during setRole in "op" command: ${error}`);
				}
			} else if (command.split(' ')[0] === 'deop') {
				ConsoleApi.Write(`> ${command}`, true, false);
				const roles = new Roles();
				const username = command.split(' ')[1];

				if (!username) {
					ConsoleApi.Error("main", "Usage: deop <username>");
					return;
				}

				try {
					const success = await roles.unsetRole(username, 1);

					if (success) {
						ConsoleApi.Log("main", `${username} deopped`);
					} else {
						ConsoleApi.Error("main", `Failed to deop ${username}`);
					}
				} catch (error) {
					ConsoleApi.Error("main", `Error during unsetRole in "deop" command: ${error}`);
				}
			} else if (command === '') {
				// Do nothing for empty command
			} else {
				ConsoleApi.Write(`> ${command}`, true, false);
				ConsoleApi.Error('Line thread', `Unknown command "${command}" loaded in main thread at net.fimastgd.forevercore`);
			}
		});
	}
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
	ConsoleApi.Log('main', "Received SIGINT signal, shutting down gracefully...");
	ConsoleApi.Log('FLS system', "Saving level chunks... [ IN FUTURE ]");
	ConsoleApi.Log('FLS system', "Saving account chunks... [ IN FUTURE ]");
	ConsoleApi.Log('main', "Stopping database server...");
	await db.end();
	ConsoleApi.Log('main', "Stopping server...");
	ConsoleApi.Log('Server thread', "----- [ SERVER STOPPED ] -----");
	process.exit(0);
});

process.on('SIGTERM', async () => {
	ConsoleApi.Log('main', "Received SIGTERM signal, shutting down gracefully...");
	ConsoleApi.Log('FLS system', "Saving level chunks... [ IN FUTURE ]");
	ConsoleApi.Log('FLS system', "Saving account chunks... [ IN FUTURE ]");
	ConsoleApi.Log('main', "Stopping database server...");
	await db.end();
	ConsoleApi.Log('main', "Stopping server...");
	ConsoleApi.Log('Server thread', "----- [ SERVER STOPPED ] -----");
	process.exit(0);
});