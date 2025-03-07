'package net.fimastgd.forevercore.modules.console-api';

const c = require('ansi-colors');
const fs = require('fs');
const path = require('path');

const minimist = require('minimist');

const args = minimist(process.argv.slice(2));
var timeformat = "Unknown";

if (args.time === 'msc') {
	timeformat = +3;
} else if (args.time === 'def') {
	timeformat = 0;
} else {
	timeformat = "Unknown";
}

class ConsoleApi {
	static Write(args, logsave = true, sendIn = true) {
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		const SEND = `${args}`;
		if (sendIn)
			console.log(SEND);
		if (logsave === true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
	}
	static Debug(thread, args, logsave = true) {
		function dateNow() {
			const currentDate = new Date();
			
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			}
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		const SEND = `[${dateNow()}] [${thread}/DEBUG]: ${args}`;
		console.log(SEND);
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
	}
	static Log(thread, args, logsave = true) {
		function dateNow() {
			const currentDate = new Date();
			
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			}
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		
		const SEND = `[${dateNow()}] [${thread}/INFO]: ${args}`;
		console.log(SEND);
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
	}
	static Warn(thread, args, logsave = true) {
		function dateNow() {
			const currentDate = new Date();
			
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			}
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		const SEND = `[${dateNow()}] [${thread}/WARN]: ${args}`;
		console.warn(c.yellowBright(SEND));
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
		
	}
	static Error(thread, args, logsave = true) {
		function dateNow() {
			const currentDate = new Date();
			
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			}
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		const SEND = `[${dateNow()}] [${thread}/ERROR]: ${args}`;
		console.log(c.redBright(SEND));
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
		
	}
	static FatalError(thread, args, logsave = true) {
		let ESFORCE = false;  
		if (timeformat == 3) {
			ESFORCE = false;
		} else if (timeformat == 0) {
			ESFORCE = false;
		} else {
			ESFORCE = true;
		}
		function dateNow() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				// ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				// process.exit(1);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
				ESFORCE = true;
			 }
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			 } else {
				 // ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				 // process.exit(1);
				 fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			 } 
			return fDate;
		}
		
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		let SEND;
		if (ESFORCE == false) {
			SEND = `[${dateNow()}] [${thread}/FATAL ERROR]: ${args}`;
		} else {
			SEND = `[${dateNow()}-UTC] [${thread}/FATAL ERROR]: ${args}`; 
		}
		console.log(c.redBright(SEND));
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
		} 
	
	// CUSTOM 
	static Log$LightGreen(thread, args, logsave = true) {
		function dateNow() {
			const currentDate = new Date();
			
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			}
			return fDate;
		}
		function dateFile() {
			const currentDate = new Date();
			let fDate;
			if (timeformat == 3) {
				currentDate.setHours(currentDate.getHours() + 3);
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;
			} else if (timeformat == 0) {
				fDate = `${currentDate.getDate().toString().padStart(2, "0")}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`; 
			} else {
				ConsoleApi.FatalError("Server thread", `Failed to get correct argument '--time' value at net.fimastgd.forevercore.modules.console-api`);
				process.exit(1);
			} 
			return fDate;
		}
		const logsDir = path.join(__dirname, '..', 'logs');
		function deleteOldLogs() {
			const now = new Date();
			fs.readdirSync(logsDir).forEach(file => {
				const filePath = path.join(logsDir, file);
		
				const datePattern = /^(\d{2})-(\d{2})-(\d{4})\.log$/;
				const match = file.match(datePattern);
		
				if (match) {
					const [day, month, year] = [parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)];
					const fileDate = new Date(year, month, day);
					const diffDays = (now - fileDate) / (1000 * 60 * 60 * 24);
					if (diffDays > 7) {
						fs.unlinkSync(filePath);
						const SENDtemp = `[${dateNow()}] [ConsoleApi/INFO]: Deleted old log file: ${file}`;
						console.log(SENDtemp);
					}
				}
			});
		}
		deleteOldLogs();
		const SEND = `[${dateNow()}] [${thread}/INFO]: ${args}`;
		console.log(c.greenBright(SEND));
		if (logsave == true) {
			const LOGFILE = `${dateFile()}.log`;
			const LOGPATH = path.join(__dirname, '..', 'logs', LOGFILE);
			fs.appendFileSync(LOGPATH, `${SEND}\n`, 'utf-8');
			const LOGLATEST = path.join(__dirname, '..', 'logs', 'latest.log');
			fs.appendFileSync(LOGLATEST, `${SEND}\n`, 'utf-8');
		} 
		return;
	} 
}

module.exports = ConsoleApi;