"package net.fimastgd.forevercore.routes.handlers.message-handler";

import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import deleteMessages from "../../api/communication/deleteMessages";
import downloadMessage from "../../api/communication/downloadMessage";
import getMessages from "../../api/communication/getMessages";
import uploadMessage from "../../api/communication/uploadMessage";
import ConsoleApi from "../../modules/console-api";

export class DeleteMessagesHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJMessages20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await deleteMessages(
				req.params.gdpsid.toString(),
				req.body.messageID,
				req.body.messages,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DeleteMessagesHandler", `Error deleting messages: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class DownloadMessageHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/downloadGJMessage20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await downloadMessage(
				req.params.gdpsid.toString(),
				req.body.messageID,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req.body.isSender,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DownloadMessageHandler", `Error downloading message: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetMessagesHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJMessages20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getMessages(
				req.params.gdpsid.toString(),
				req.body.page,
				req.body.getSent,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetMessagesHandler", `Error getting messages: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadMessageHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJMessage20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await uploadMessage(
				req.params.gdpsid.toString(),
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.secret,
				req.body.subject,
				req.body.toAccountID,
				req.body.body,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadMessageHandler", `Error uploading message: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createCommunicationHandlers() {
	return [new DeleteMessagesHandler(), new DownloadMessageHandler(), new GetMessagesHandler(), new UploadMessageHandler()];
}
