import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import deleteList from "@api/packs/lists/deleteList";
import uploadList from "@api/packs/lists/uploadList";
import getLists from "@api/packs/lists/getLists";
import ConsoleApi from "@console-api";

export class DeleteListHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJLevelList.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await deleteList(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DeleteListHandler", `${req.params.gdpsid.toString()}* Error deleting list: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadListHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJLevelList.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await uploadList(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadListHandler", `${req.params.gdpsid.toString()}* Error uploading list: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetListsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJLevelLists.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getLists(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetListsHandler", `${req.params.gdpsid.toString()}* Error getting list: ${error}`);
			res.status(200).send("-1");
		}
	} 
}

export function createListHandlers() {
	return [new DeleteListHandler(), new UploadListHandler(), new GetListsHandler()];
}
