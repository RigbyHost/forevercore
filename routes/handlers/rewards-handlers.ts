import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import getChallenges from '../../api/rewards/getChallenges';
import getChests from '../../api/rewards/getChests';
import ConsoleApi from '../../modules/console-api';

export class GetChallengesHandler extends BaseApiHandler {
    constructor() {
        super('/getGJChallenges.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getChallenges(
                req.body.accountID,
                req.body.udid,
                req.body.chk
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetChallengesHandler', `Error getting challenges: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class GetChestsHandler extends BaseApiHandler {
    constructor() {
        super('/getGJChests.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getChests(
                req.body.chk,
                req.body.rewardType,
                req.body.udid,
                req.body.accountID,
                req.body.gameVersion,
                req.body.gjp2,
                req.body.gjp,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetChestsHandler', `Error getting chests: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createRewardsHandlers() {
    return [
        new GetChallengesHandler(),
        new GetChestsHandler()
    ];
}