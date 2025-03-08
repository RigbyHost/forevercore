'package net.fimastgd.forevercore.routes.handlers.account-handlers';

import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import registerAccount from '../../api/accounts/register';
import loginAccount from '../../api/accounts/login';
import backupAccount from '../../api/accounts/backup';
import syncAccount from '../../api/accounts/sync';
import getUserInfo from '../../api/accounts/getUserInfo';
import updateSettings from '../../api/accounts/updateSettings';
import ConsoleApi from '../../modules/console-api';

/**
 * Handler for account registration endpoint
 */
export class RegisterAccountHandler extends BaseApiHandler {
    constructor() {
        super('/accounts/registerGJAccount.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await registerAccount(
                req.body.userName,
                req.body.password,
                req.body.email
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('RegisterAccountHandler', `Error during registration: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for account login endpoint
 */
export class LoginAccountHandler extends BaseApiHandler {
    constructor() {
        super('/accounts/loginGJAccount.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await loginAccount(
                req.body.userName,
                req.body.udid,
                req.body.password,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('LoginAccountHandler', `Error during login: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for account backup endpoint
 */
export class BackupAccountHandler extends BaseApiHandler {
    constructor() {
        super('/accounts/backupGJAccount.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Backup', `Attempt to backup account (standard): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await backupAccount(
                req.body.userName,
                req.body.password,
                req.body.saveData,
                req.body.accountID,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('BackupAccountHandler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for account backup (GD 2.0) endpoint
 */
export class BackupAccount20Handler extends BaseApiHandler {
    constructor() {
        super('/accounts/backupGJAccount20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Backup', `Attempt to backup account (2.0): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await backupAccount(
                req.body.userName,
                req.body.password,
                req.body.saveData,
                req.body.accountID,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('BackupAccount20Handler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for new account backup endpoint
 */
export class BackupAccountNewHandler extends BaseApiHandler {
    constructor() {
        super('/database/accounts/backupGJAccountNew.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Backup', `Attempt to backup account (new): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await backupAccount(
                req.body.userName,
                req.body.password,
                req.body.saveData,
                req.body.accountID,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('BackupAccountNewHandler', `Error during backup: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for account sync endpoint
 */
export class SyncAccountHandler extends BaseApiHandler {
    constructor() {
        super('/accounts/syncGJAccount.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Sync', `Attempt to sync account (standard): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await syncAccount(
                req.body.userName,
                req.body.accountID,
                req.body.password,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('SyncAccountHandler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for account sync (GD 2.0) endpoint
 */
export class SyncAccount20Handler extends BaseApiHandler {
    constructor() {
        super('/accounts/syncGJAccount20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Sync', `Attempt to sync account (2.0): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await syncAccount(
                req.body.userName,
                req.body.accountID,
                req.body.password,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('SyncAccount20Handler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for new account sync endpoint
 */
export class SyncAccountNewHandler extends BaseApiHandler {
    constructor() {
        super('/database/accounts/syncGJAccountNew.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Sync', `Attempt to sync account (new): username=${req.body.userName}, accountID=${req.body.accountID}`);
            
            const result = await syncAccount(
                req.body.userName,
                req.body.accountID,
                req.body.password,
                req.body.gjp2,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('SyncAccountNewHandler', `Error during sync: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for getting user info endpoint
 */
export class GetUserInfoHandler extends BaseApiHandler {
    constructor() {
        super('/getGJUserInfo20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getUserInfo(
                req.body.targetAccountID,
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetUserInfoHandler', `Error getting user info: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for updating account settings
 */
export class UpdateSettingsHandler extends BaseApiHandler {
    constructor() {
        super('/updateGJAccSettings20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const x = req.body.twitter; // Twitter (x) handle

            const result = await updateSettings(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req.body.mS,
                req.body.frS,
                req.body.cS,
                req.body.yt,
                x,
                req.body.twitch,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('UpdateSettingsHandler', `Error updating settings: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Create all account handlers
 * @returns Array of account API handlers
 */
export function createAccountHandlers() {
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
        new UpdateSettingsHandler()
    ];
}

export default createAccountHandlers;