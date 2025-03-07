import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import { calculate } from '../../api/system/calculateCPs';
import ConsoleApi from '../../modules/console-api';

export class CalculateCPsHandler extends BaseApiHandler {
    constructor() {
        super('/calculateCPs.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await calculate();
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('CalculateCPsHandler', `Error calculating creator points: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createSystemHandlers() {
    return [
        new CalculateCPsHandler()
    ];
}