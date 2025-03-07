import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import requestUserAccess from '../../api/mods/requestUserAccess';
import ConsoleApi from '../../modules/console-api';

export class RequestUserAccessHandler extends BaseApiHandler {
    constructor() {
        super('/requestUserAccess.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await requestUserAccess(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('RequestUserAccessHandler', `Error requesting user access: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createModsHandlers() {
    return [
        new RequestUserAccessHandler()
    ];
}