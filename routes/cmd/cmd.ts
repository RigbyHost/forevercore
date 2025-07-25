'package net.fimastgd.forevercore.routes.cmd.cmd';

// приёмник команд

import express from 'express';
import { Connection, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
import ConsoleApi from "../../modules/console-api";
import { Roles } from "../../panel/roles/roles";
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const db: Connection = require("../../serverconf/db");

let parsedYaml: any = {};
try {
    const yamlPath = path.join(__dirname, '../../config/console-stream.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
} catch (error) {
    ConsoleApi.Error("js-yaml", `${error} at net.fimastgd.forevercore.routes.cmd.cmd`)
}
const $_HASH: string = parsedYaml.secure_connection;

router.post('/', async (req: express.Request, res: express.Response) => {
    if (req.body.hash.toString() === $_HASH) {
		const command: string = req.body.cmd.toString();
		let command_array: string[] = command.split(' ');
		if (command === "stop") {
			ConsoleApi.Write("> stop", true);
			ConsoleApi.Log('FLS', "Saving level chunks... [ IN FUTURE ]");
			ConsoleApi.Log('FLS', "Saving account chunks... [ IN FUTURE ]");
			ConsoleApi.Log('main', "Stopping database server...");
			db.end();
			ConsoleApi.Log('main', "Stopping server...");
			ConsoleApi.Log('Server thread', "----- [ SERVER STOPPED ] -----");
			setTimeout(() => {
				process.exit(0);
			}, 1300);
		} else if (command_array[0] === "op") {
			ConsoleApi.Write(`> ${command}`, true);
			const roles = new Roles();
			const username: string = command_array[1];

			roles.setRole("", username, 1)
				.then(opuser => {
					if (opuser) {
						ConsoleApi.Log("main", `${username} opped`);
					} else {
						ConsoleApi.Error("main", `Failed to op ${username}`);
					}
				})
				.catch(error => {
					ConsoleApi.Error("main", `Error during setRole in "op" command: ${error.message} at net.fimastgd.forevercore.routes.cmd.cmd`);
				});
		} else if (command_array[0] === "deop") {
			ConsoleApi.Write(`> ${command}`, true);
			const roles = new Roles();
			const username: string = command_array[1];

			roles.unsetRole("", username, 1)
				.then(opuser => {
					if (opuser) {
						ConsoleApi.Log("main", `${username} deopped`);
					} else {
						ConsoleApi.Error("main", `Failed to deop ${username}`);
					}
				})
				.catch(error => {
					ConsoleApi.Error("main", `Error during unsetRole in "deop" command: ${error.message} at net.fimastgd.forevercore.routes.cmd.cdm`);
				});
		} else if (command === "") {
			// nothing 
		} else {
			ConsoleApi.Write(`> ${command}`, true, true);
			ConsoleApi.Error('Line thread', `Unknown command "${command}" loaded in main thread at net.fimastgd.forevercore`);
		}
		res.status(200).send("1");
		return;
	} else {
		res.status(200).send("-1");
    }
}); 

export default router;  