`package net.fimastgd.forevercore.routes.handlers.other-handlers`;

import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import getSongInfo from "../../api/other/getSongInfo";
import likeItem from "../../api/other/likeItem";
import topArtists from "../../api/other/topArtists";
import ConsoleApi from "../../modules/console-api";

// Обработчики для лайков (разделены по версиям)
export class LikeItemBaseHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/likeGJItem.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await likeItem(req.params.gdpsid.toString(), req.body.type, req.body.like, req.body.itemID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LikeItemBaseHandler", `Error liking item: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class LikeItem19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/likeGJItem19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await likeItem(req.params.gdpsid.toString(), req.body.type, req.body.like, req.body.itemID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LikeItem19Handler", `Error liking item: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class LikeItem20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/likeGJItem20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await likeItem(req.params.gdpsid.toString(), req.body.type, req.body.like, req.body.itemID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LikeItem20Handler", `Error liking item: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class LikeItem21Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/likeGJItem21.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await likeItem(req.params.gdpsid.toString(), req.body.type, req.body.like, req.body.itemID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LikeItem21Handler", `Error liking item: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class LikeItem211Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/likeGJItem211.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await likeItem(req.params.gdpsid.toString(), req.body.type, req.body.like, req.body.itemID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("LikeItem211Handler", `Error liking item: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для получения информации о песнях
export class GetSongInfoHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJSongInfo.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getSongInfo(req.params.gdpsid.toString(), req.body.songID);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetSongInfoHandler", `Error getting song info: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для топ-артистов
export class TopArtistsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJTopArtists.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await topArtists(req.params.gdpsid.toString(), req.body.page);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("TopArtistsHandler", `Error getting top artists: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчик для получения URL кастомного контента
export class GetCustomContentURLHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getCustomContentURL.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).send("https://geometrydashfiles.b-cdn.net");
		} catch (error) {
			ConsoleApi.Error("GetCustomContentURLHandler", `Error getting custom content url: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createOtherHandlers() {
	return [
		// лайки
		new LikeItemBaseHandler(),
		new LikeItem19Handler(),
		new LikeItem20Handler(),
		new LikeItem21Handler(),
		new LikeItem211Handler(),
		// музыка
		new GetSongInfoHandler(),
		new TopArtistsHandler(),
		// системные
		new GetCustomContentURLHandler()
	];
}
