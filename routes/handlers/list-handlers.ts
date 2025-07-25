import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import deleteList from "../../api/packs/lists/deleteList";
import uploadList from "../../api/packs/lists/uploadList";
import ConsoleApi from "../../modules/console-api";

export class DeleteListHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJList.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await deleteList(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DeleteListHandler", `Error deleting list: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadListHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJList.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await uploadList(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadListHandler", `Error uploading list: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createListHandlers() {
	return [new DeleteListHandler(), new UploadListHandler()];
}
