import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import getGauntlets from '../../api/packs/getGauntlets';
import getMapPacks from '../../api/packs/getMapPacks';
import ConsoleApi from '../../modules/console-api';

export class GetGauntletsHandler extends BaseApiHandler {
    constructor() {
        super('/getGJGauntlets.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getGauntlets();
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetGauntletsHandler', `Error getting gauntlets: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class GetMapPacksHandler extends BaseApiHandler {
    constructor() {
        super('/getGJMapPacks.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getMapPacks(req);
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetMapPacksHandler', `Error getting map packs: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createPacksHandlers() {
    return [
        new GetGauntletsHandler(),
        new GetMapPacksHandler()
    ];
}