`package net.fimastgd.forevercore.routes.handlers.score-handlers`;

import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import getCreators from "../../api/scores/getCreators";
import getLevelScores from "../../api/scores/getLevelScores";
import getLevelScoresPlat from "../../api/scores/getLevelScoresPlat";
import getScores from "../../api/scores/getScores";
import updateUserScore from "../../api/scores/updateUserScore";
import ConsoleApi from "../../modules/console-api";

// Обработчики для creators (разделены по версиям)
export class GetCreatorsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJCreators.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getCreators(req.params.gdpsid.toString(), req.body.accountID, req.body.type);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetCreatorsHandler", `Error getting creators: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetCreators19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJCreators19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getCreators(req.params.gdpsid.toString(), req.body.accountID, req.body.type);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetCreators19Handler", `Error getting creators: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для level scores (разделены по версиям)
export class GetLevelScoresHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJLevelScores.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getLevelScores(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req.body.levelID,
				req.body.percent,
				req.body.s1,
				req.body.s2,
				req.body.s3,
				req.body.s6,
				req.body.s9,
				req.body.s10,
				req.body.type,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetLevelScoresHandler", `Error getting level scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetLevelScores211Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJLevelScores211.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getLevelScores(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req.body.levelID,
				req.body.percent,
				req.body.s1,
				req.body.s2,
				req.body.s3,
				req.body.s6,
				req.body.s9,
				req.body.s10,
				req.body.type,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetLevelScores211Handler", `Error getting level scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetLevelScoresPlatHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJLevelScoresPlat.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getLevelScoresPlat(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetLevelScoresPlatHandler", `Error getting platformer level scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для общих scores (разделены по версиям)
export class GetScoresHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJScores.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getScores(
				req.params.gdpsid.toString(),
				req.body.gameVersion,
				req.body.accountID,
				req.body.udid,
				req.body.type,
				req.body.count,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetScoresHandler", `Error getting scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetScores19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJScores19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getScores(
				req.params.gdpsid.toString(),
				req.body.gameVersion,
				req.body.accountID,
				req.body.udid,
				req.body.type,
				req.body.count,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetScores19Handler", `Error getting scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetScores20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJScores20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getScores(
				req.params.gdpsid.toString(),
				req.body.gameVersion,
				req.body.accountID,
				req.body.udid,
				req.body.type,
				req.body.count,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetScores20Handler", `Error getting scores: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для обновления счета (разделены по версиям)
export class UpdateUserScoreHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJUserScore.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await updateUserScore(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.userName,
				req.body.secret,
				req.body.stars,
				req.body.demons,
				req.body.icon,
				req.body.color1,
				req.body.color2,
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.coins,
				req.body.iconType,
				req.body.userCoins,
				req.body.special,
				req.body.accIcon,
				req.body.accShip,
				req.body.accBall,
				req.body.accBird,
				req.body.accDart,
				req.body.accRobot,
				req.body.accGlow,
				req.body.accSpider,
				req.body.accExplosion,
				req.body.diamonds,
				req.body.moons,
				req.body.color3,
				req.body.accSwing,
				req.body.accJetpack,
				req.body.dinfo,
				req.body.dinfow,
				req.body.dinfog,
				req.body.sinfo,
				req.body.sinfod,
				req.body.sinfog,
				req.body.udid,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScoreHandler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UpdateUserScore19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJUserScore19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await updateUserScore(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.userName,
				req.body.secret,
				req.body.stars,
				req.body.demons,
				req.body.icon,
				req.body.color1,
				req.body.color2,
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.coins,
				req.body.iconType,
				req.body.userCoins,
				req.body.special,
				req.body.accIcon,
				req.body.accShip,
				req.body.accBall,
				req.body.accBird,
				req.body.accDart,
				req.body.accRobot,
				req.body.accGlow,
				req.body.accSpider,
				req.body.accExplosion,
				req.body.diamonds,
				req.body.moons,
				req.body.color3,
				req.body.accSwing,
				req.body.accJetpack,
				req.body.dinfo,
				req.body.dinfow,
				req.body.dinfog,
				req.body.sinfo,
				req.body.sinfod,
				req.body.sinfog,
				req.body.udid,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScore19Handler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UpdateUserScore20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJUserScore20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await updateUserScore(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.userName,
				req.body.secret,
				req.body.stars,
				req.body.demons,
				req.body.icon,
				req.body.color1,
				req.body.color2,
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.coins,
				req.body.iconType,
				req.body.userCoins,
				req.body.special,
				req.body.accIcon,
				req.body.accShip,
				req.body.accBall,
				req.body.accBird,
				req.body.accDart,
				req.body.accRobot,
				req.body.accGlow,
				req.body.accSpider,
				req.body.accExplosion,
				req.body.diamonds,
				req.body.moons,
				req.body.color3,
				req.body.accSwing,
				req.body.accJetpack,
				req.body.dinfo,
				req.body.dinfow,
				req.body.dinfog,
				req.body.sinfo,
				req.body.sinfod,
				req.body.sinfog,
				req.body.udid,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScore20Handler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UpdateUserScore21Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJUserScore21.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await updateUserScore(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.userName,
				req.body.secret,
				req.body.stars,
				req.body.demons,
				req.body.icon,
				req.body.color1,
				req.body.color2,
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.coins,
				req.body.iconType,
				req.body.userCoins,
				req.body.special,
				req.body.accIcon,
				req.body.accShip,
				req.body.accBall,
				req.body.accBird,
				req.body.accDart,
				req.body.accRobot,
				req.body.accGlow,
				req.body.accSpider,
				req.body.accExplosion,
				req.body.diamonds,
				req.body.moons,
				req.body.color3,
				req.body.accSwing,
				req.body.accJetpack,
				req.body.dinfo,
				req.body.dinfow,
				req.body.dinfog,
				req.body.sinfo,
				req.body.sinfod,
				req.body.sinfog,
				req.body.udid,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScore21Handler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UpdateUserScore22Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/updateGJUserScore22.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await updateUserScore(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.userName,
				req.body.secret,
				req.body.stars,
				req.body.demons,
				req.body.icon,
				req.body.color1,
				req.body.color2,
				req.body.gameVersion,
				req.body.binaryVersion,
				req.body.coins,
				req.body.iconType,
				req.body.userCoins,
				req.body.special,
				req.body.accIcon,
				req.body.accShip,
				req.body.accBall,
				req.body.accBird,
				req.body.accDart,
				req.body.accRobot,
				req.body.accGlow,
				req.body.accSpider,
				req.body.accExplosion,
				req.body.diamonds,
				req.body.moons,
				req.body.color3,
				req.body.accSwing,
				req.body.accJetpack,
				req.body.dinfo,
				req.body.dinfow,
				req.body.dinfog,
				req.body.sinfo,
				req.body.sinfod,
				req.body.sinfog,
				req.body.udid,
				req.body.gjp2,
				req.body.gjp,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScore22Handler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createScoresHandlers() {
	return [
		// creators
		new GetCreatorsHandler(),
		new GetCreators19Handler(),
		// level scores
		new GetLevelScoresHandler(),
		new GetLevelScores211Handler(),
		new GetLevelScoresPlatHandler(),
		// scores
		new GetScoresHandler(),
		new GetScores19Handler(),
		new GetScores20Handler(),
		// user scores
		new UpdateUserScoreHandler(),
		new UpdateUserScore19Handler(),
		new UpdateUserScore20Handler(),
		new UpdateUserScore21Handler(),
		new UpdateUserScore22Handler()
	];
}
