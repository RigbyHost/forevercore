'package net.fimastgd.forevercore.routes.cmd.cmd';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// приёмник команд
const express_1 = __importDefault(require("express"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const roles_1 = require("../../panel/roles/roles");
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const router = express_1.default.Router();
const db = require("../../serverconf/db");
let parsedYaml = {};
try {
    const yamlPath = path.join(__dirname, '../../config/console-stream.yml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    parsedYaml = yaml.load(fileContents);
}
catch (error) {
    console_api_1.default.Error("js-yaml", `${error} at net.fimastgd.forevercore.routes.cmd.cmd`);
}
const $_HASH = parsedYaml.secure_connection;
router.post('/', async (req, res) => {
    if (req.body.hash.toString() === $_HASH) {
        const command = req.body.cmd.toString();
        let command_array = command.split(' ');
        if (command === "stop") {
            console_api_1.default.Write("> stop", true);
            console_api_1.default.Log('FLS', "Saving level chunks... [ IN FUTURE ]");
            console_api_1.default.Log('FLS', "Saving account chunks... [ IN FUTURE ]");
            console_api_1.default.Log('main', "Stopping database server...");
            db.end();
            console_api_1.default.Log('main', "Stopping server...");
            console_api_1.default.Log('Server thread', "----- [ SERVER STOPPED ] -----");
            setTimeout(() => {
                process.exit(0);
            }, 1300);
        }
        else if (command_array[0] === "op") {
            console_api_1.default.Write(`> ${command}`, true);
            const roles = new roles_1.Roles();
            const username = command_array[1];
            roles.setRole(username, 1)
                .then(opuser => {
                if (opuser) {
                    console_api_1.default.Log("main", `${username} opped`);
                }
                else {
                    console_api_1.default.Error("main", `Failed to op ${username}`);
                }
            })
                .catch(error => {
                console_api_1.default.Error("main", `Error during setRole in "op" command: ${error.message} at net.fimastgd.forevercore.routes.cmd.cmd`);
            });
        }
        else if (command_array[0] === "deop") {
            console_api_1.default.Write(`> ${command}`, true);
            const roles = new roles_1.Roles();
            const username = command_array[1];
            roles.unsetRole(username, 1)
                .then(opuser => {
                if (opuser) {
                    console_api_1.default.Log("main", `${username} deopped`);
                }
                else {
                    console_api_1.default.Error("main", `Failed to deop ${username}`);
                }
            })
                .catch(error => {
                console_api_1.default.Error("main", `Error during unsetRole in "deop" command: ${error.message} at net.fimastgd.forevercore.routes.cmd.cdm`);
            });
        }
        else if (command === "") {
            // nothing 
        }
        else {
            console_api_1.default.Write(`> ${command}`, true, true);
            console_api_1.default.Error('Line thread', `Unknown command "${command}" loaded in main thread at net.fimastgd.forevercore`);
        }
        res.status(200).send("1");
        return;
    }
    else {
        res.status(200).send("-1");
    }
});
exports.default = router;
