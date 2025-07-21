'package net.fimastgd.forevercore.routes.handlers.account-handlers';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAccountURLHandler = exports.UpdateSettingsHandler = exports.GetUserInfoHandler = exports.SyncAccountNewHandler = exports.SyncAccount20Handler = exports.SyncAccountHandler = exports.BackupAccountNewHandler = exports.BackupAccount20Handler = exports.BackupAccountHandler = exports.LoginAccountHandler = exports.RegisterAccountHandler = void 0;
exports.createAccountHandlers = createAccountHandlers;
const api_router_1 = require("../api-router");
const register_1 = __importDefault(require("../../api/accounts/register"));
const login_1 = __importDefault(require("../../api/accounts/login"));
const backup_1 = __importDefault(require("../../api/accounts/backup"));
const sync_1 = __importDefault(require("../../api/accounts/sync"));
const getUserInfo_1 = __importDefault(require("../../api/accounts/getUserInfo"));
const updateSettings_1 = __importDefault(require("../../api/accounts/updateSettings"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const getAccountURL_1 = __importDefault(require("../../api/lib/getAccountURL"));
// Helper function to get GDPS ID from request or use default
function getGdpsId(req) {
    // Try to get from URL params first (for routes like /:gdpsid/api/...)
    if (req.params.gdpsid) {
        return req.params.gdpsid;
    }
    // Try to get from query params
    if (req.query.gdpsid && typeof req.query.gdpsid === 'string') {
        return req.query.gdpsid;
    }
    // Use default GDPS ID
    return 'main'; // или другой ID по умолчанию
}
/**
 * Handler for account registration endpoint
 */
class RegisterAccountHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/registerGJAccount.php');
    }
    async handle(req, res) {
        try {
            const gdpsid = getGdpsId(req);
            const result = await (0, register_1.default)(gdpsid, req.body.userName, req.body.password, req.body.email);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('RegisterAccountHandler', `Error during registration: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.RegisterAccountHandler = RegisterAccountHandler;
/**
 * Handler for account login endpoint
 */
class LoginAccountHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/loginGJAccount.php');
    }
    async handle(req, res) {
        try {
            const gdpsid = getGdpsId(req);
            const result = await (0, login_1.default)(gdpsid, req.body.userName, req.body.udid, req.body.password, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('LoginAccountHandler', `Error during login: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.LoginAccountHandler = LoginAccountHandler;
/**
 * Handler for account backup endpoint
 */
class BackupAccountHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/backupGJAccount.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Backup', `Attempt to backup account (standard): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, backup_1.default)(gdpsid, req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('BackupAccountHandler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.BackupAccountHandler = BackupAccountHandler;
/**
 * Handler for account backup (GD 2.0) endpoint
 */
class BackupAccount20Handler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/backupGJAccount20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Backup', `Attempt to backup account (2.0): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, backup_1.default)(gdpsid, req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('BackupAccount20Handler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.BackupAccount20Handler = BackupAccount20Handler;
/**
 * Handler for new account backup endpoint
 */
class BackupAccountNewHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/database/accounts/backupGJAccountNew.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Backup', `Attempt to backup account (new): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, backup_1.default)(gdpsid, req.body.userName, req.body.password, req.body.saveData, req.body.accountID, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('BackupAccountNewHandler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.BackupAccountNewHandler = BackupAccountNewHandler;
/**
 * Handler for account sync endpoint
 */
class SyncAccountHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/syncGJAccount.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Sync', `Attempt to sync account (standard): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, sync_1.default)(gdpsid, req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('SyncAccountHandler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.SyncAccountHandler = SyncAccountHandler;
/**
 * Handler for account sync (GD 2.0) endpoint
 */
class SyncAccount20Handler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/accounts/syncGJAccount20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Sync', `Attempt to sync account (2.0): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, sync_1.default)(gdpsid, req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('SyncAccount20Handler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.SyncAccount20Handler = SyncAccount20Handler;
/**
 * Handler for new account sync endpoint
 */
class SyncAccountNewHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/database/accounts/syncGJAccountNew.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Sync', `Attempt to sync account (new): username=${req.body.userName}, accountID=${req.body.accountID}`);
            const gdpsid = getGdpsId(req);
            const result = await (0, sync_1.default)(gdpsid, req.body.userName, req.body.accountID, req.body.password, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('SyncAccountNewHandler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.SyncAccountNewHandler = SyncAccountNewHandler;
/**
 * Handler for getting user info endpoint
 */
class GetUserInfoHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJUserInfo20.php');
    }
    async handle(req, res) {
        try {
            const gdpsid = getGdpsId(req);
            const result = await (0, getUserInfo_1.default)(gdpsid, req.body.targetAccountID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetUserInfoHandler', `Error getting user info: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetUserInfoHandler = GetUserInfoHandler;
/**
 * Handler for updating account settings
 */
class UpdateSettingsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/updateGJAccSettings20.php');
    }
    async handle(req, res) {
        try {
            const x = req.body.twitter; // Twitter (x) handle
            const gdpsid = getGdpsId(req);
            const result = await (0, updateSettings_1.default)(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req.body.mS, req.body.frS, req.body.cS, req.body.yt, x, req.body.twitch, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UpdateSettingsHandler', `Error updating settings: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UpdateSettingsHandler = UpdateSettingsHandler;
/**
 * Handler for the getAccountURL.php endpoint
 * Required by Geometry Dash client to determine server protocol
 */
class GetAccountURLHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getAccountURL.php');
    }
    /**
     * Handles requests to getAccountURL.php
     * @param req - Express request object
     * @param res - Express response object
     * @returns Promise resolving when handling is complete
     */
    async handle(req, res) {
        try {
            console_api_1.default.Log('GetAccountURL', `Protocol request received from client`);
            // Get protocol (http/https)
            const protocol = await (0, getAccountURL_1.default)(req);
            // Form proper server URL
            const serverURL = protocol + '://' + req.headers.host;
            console_api_1.default.Log('GetAccountURL', `Returning URL: ${serverURL}`);
            // Return result to client
            res.status(200).send(serverURL);
        }
        catch (error) {
            console_api_1.default.Error('GetAccountURLHandler', `Error retrieving protocol: ${error}`);
            res.status(200).send('http://' + req.headers.host); // Fallback option
        }
    }
}
exports.GetAccountURLHandler = GetAccountURLHandler;
/**
 * Create all account handlers
 * @returns Array of account API handlers
 */
function createAccountHandlers() {
    return [
        new RegisterAccountHandler(),
        new LoginAccountHandler(),
        new BackupAccountHandler(),
        new BackupAccount20Handler(),
        new BackupAccountNewHandler(),
        new SyncAccountHandler(),
        new SyncAccount20Handler(),
        new SyncAccountNewHandler(),
        new GetUserInfoHandler(),
        new UpdateSettingsHandler(),
        new GetAccountURLHandler()
    ];
}
exports.default = createAccountHandlers;
