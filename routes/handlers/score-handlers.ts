import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import getCreators from "../../api/scores/getCreators";
import getLevelScores from "../../api/scores/getLevelScores";
import getLevelScoresPlat from "../../api/scores/getLevelScoresPlat";
import getScores from "../../api/scores/getScores";
import updateUserScore from "../../api/scores/updateUserScore";
import ConsoleApi from "../../modules/console-api";

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

export class UpdateUserScoreHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/:updateGJUserScore");
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
			if (
				req.params.updateGJUserScore == "updateGJUserScore.php" ||
				req.params.updateGJUserScore == "updateGJUserScore21.php" ||
				req.params.updateGJUserScore == "updateGJUserScore22.php"
			)
				res.status(200).send(result);
			else res.status(404);
		} catch (error) {
			ConsoleApi.Error("UpdateUserScoreHandler", `Error updating user score: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createScoresHandlers() {
	return [
		new GetCreatorsHandler(),
		new GetLevelScoresHandler(),
		new GetLevelScoresPlatHandler(),
		new GetScoresHandler(),
		new UpdateUserScoreHandler()
	];
}
