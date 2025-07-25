"package net.fimastgd.forevercore.routes.handlers.account-handlers";

import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import registerAccount from "../../api/accounts/register";
import loginAccount from "../../api/accounts/login";
import backupAccount from "../../api/accounts/backup";
import syncAccount from "../../api/accounts/sync";
import getUserInfo from "../../api/accounts/getUserInfo";
import updateSettings from "../../api/accounts/updateSettings";
import ConsoleApi from "../../modules/console-api";
import getAccountURL from "../../api/lib/getAccountURL";

/**
 * Handler for account registration endpoint
 */
export class RegisterAccountHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/registerGJAccount.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			const result = await registerAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.password,
				req.body.email
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("RegisterAccountHandler", `Error during registration: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for account login endpoint
 */
export class LoginAccountHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/loginGJAccount.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			const result = await loginAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.udid,
				req.body.password,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LoginAccountHandler", `Error during login: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for account backup endpoint
 */
export class BackupAccountHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/backupGJAccount.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid;
			ConsoleApi.Log(
				"Backup",
				`Attempt to backup account (standard): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`
			);

			const result = await backupAccount(
				gdpsid,
				req.body.userName,
				req.body.password,
				req.body.saveData,
				req.body.accountID,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("BackupAccountHandler", `Error during backup: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for account backup (GD 2.0) endpoint
 */
export class BackupAccount20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/backupGJAccount20.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			ConsoleApi.Log(
				"Backup",
				`Attempt to backup account (2.0): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`
			);

			const result = await backupAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.password,
				req.body.saveData,
				req.body.accountID,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("BackupAccount20Handler", `Error during backup: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for new account backup endpoint
 */
export class BackupAccountNewHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/database/accounts/backupGJAccountNew.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			ConsoleApi.Log(
				"Backup",
				`Attempt to backup account (new): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`
			);

			const result = await backupAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.password,
				req.body.saveData,
				req.body.accountID,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("BackupAccountNewHandler", `Error during backup: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for account sync endpoint
 */
export class SyncAccountHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/syncGJAccount.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			ConsoleApi.Log(
				"Sync",
				`Attempt to sync account (standard): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`
			);

			const result = await syncAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.accountID,
				req.body.password,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("SyncAccountHandler", `Error during sync: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for account sync (GD 2.0) endpoint
 */
export class SyncAccount20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/accounts/syncGJAccount20.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			ConsoleApi.Log("Sync", `Attempt to sync account (2.0): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`);

			const result = await syncAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.accountID,
				req.body.password,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("SyncAccount20Handler", `Error during sync: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for new account sync endpoint
 */
export class SyncAccountNewHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/database/accounts/syncGJAccountNew.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			ConsoleApi.Log("Sync", `Attempt to sync account (new): gdpsid=${gdpsid}, username=${req.body.userName}, accountID=${req.body.accountID}`);

			const result = await syncAccount(
				gdpsid, // Pass GDPS ID
				req.body.userName,
				req.body.accountID,
				req.body.password,
				req.body.gjp2,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("SyncAccountNewHandler", `Error during sync: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for getting user info endpoint
 */
export class GetUserInfoHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJUserInfo20.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			const result = await getUserInfo(
				gdpsid, // Pass GDPS ID
				req.body.targetAccountID,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetUserInfoHandler", `Error getting user info: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for updating account settings
 */
export class UpdateSettingsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJAccSettings20.php"); // Added gdpsid to route
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid = req.params.gdpsid; // Extract GDPS ID
			const x = req.body.twitter; // Twitter (x) handle

			const result = await updateSettings(
				gdpsid, // Pass GDPS ID
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
			ConsoleApi.Error("UpdateSettingsHandler", `Error updating settings: ${error}`);
			res.status(200).send("-1");
		}
	}
}

/**
 * Handler for the getAccountURL.php endpoint
 */

/* НЕТЕСТИРОВАНО! */
export class GetAccountURLHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getAccountURL.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			ConsoleApi.Log("GetAccountURL", `Protocol request received from client`);
			const protocol = await getAccountURL(req);
			const serverURL = protocol + "://" + req.headers.host + "/" + req.params.gdpsid;
			ConsoleApi.Log("GetAccountURL", `Returning URL: ${serverURL}`);
			res.status(200).send(serverURL);
		} catch (error) {
			ConsoleApi.Error("GetAccountURLHandler", `Error retrieving protocol: ${error}`);
			res.status(200).send("http://" + req.headers.host + "/" + req.params.gdpsid);
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
		new UpdateSettingsHandler(),
		new GetAccountURLHandler()
	];
}

export default createAccountHandlers;
