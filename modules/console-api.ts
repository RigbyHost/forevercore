'package net.fimastgd.forevercore.modules.console-api';

import * as c from 'ansi-colors';
import * as fs from 'fs';
import * as path from 'path';
import minimist from 'minimist';

// Parse command line arguments
const args = minimist(process.argv.slice(2));
let timeformat: number | string = "Unknown";

if (args.time === 'msc') {
	timeformat = 3;
} else if (args.time === 'def') {
	timeformat = 0;
} else {
	timeformat = "Unknown";
}

/**
 * Time format utility function for log files
 */
function dateFile(): string {
	const currentDate = new Date();
	let fDate: string;

	if (timeformat === 3) {
		currentDate.setHours(currentDate.getHours() + 3);
		fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
	} else if (timeformat === 0) {
		fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
	} else {
		ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
		process.exit(1);
		fDate = ''; // Unreachable but needed for TypeScript
	}

	return fDate;
}

/**
 * Time format utility function for log messages
 */
function dateNow(): string {
	const currentDate = new Date();
	let fDate: string;

	if (timeformat === 3) {
		currentDate.setHours(currentDate.getHours() + 3);
		fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
	} else if (timeformat === 0) {
		fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
	} else {
		ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
		process.exit(1);
		fDate = ''; // Unreachable but needed for TypeScript
	}

	return fDate;
}

/**
 * Delete old log files older than 7 days
 */
function deleteOldLogs(): void {
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
	static Write(args: string, logsave: boolean = true, sendIn: boolean = true): void {
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
	static Debug(thread: string, args: string, logsave: boolean = true): void {
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
	static Log(thread: string, args: string, logsave: boolean = true): void {
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
	static Warn(thread: string, args: string, logsave: boolean = true): void {
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
	static Error(thread: string, args: string, logsave: boolean = true): void {
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
	static FatalError(thread: string, args: string, logsave: boolean = true): void {
		let ESFORCE = false;

		if (timeformat === 3) {
			ESFORCE = false;
		} else if (timeformat === 0) {
			ESFORCE = false;
		} else {
			ESFORCE = true;
		}

		deleteOldLogs();

		let SEND: string;
		if (ESFORCE === false) {
			SEND = `[${dateNow()}] [${thread}/FATAL ERROR]: ${args}`;
		} else {
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
	static Log$LightGreen(thread: string, args: string, logsave: boolean = true): void {
		deleteOldLogs();

		const SEND = `[${dateNow()}] [${thread}/INFO]: ${args}`;
		console.log(c.bold.greenBright(SEND));

		if (logsave) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');

			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		}
	}
}

export default ConsoleApi;