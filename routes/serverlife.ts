'package net.fimastgd.forevercore.routes.serverlife';

import express from 'express';
import cookieParser from 'cookie-parser';
import { settings } from '../serverconf/settings';
import banUser from '../panel/leaderboard/ban';
import unbanUser from '../panel/leaderboard/unban';
import Panel from '../panel/main';
import getRoleInfo from '../panel/accounts/getRoleInfo';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import ConsoleApi from '../modules/console-api';
import os from 'os';
 
const db: Connection = require("../serverconf/db");
const GDPSID: string = settings.GDPSID.toString();

const router = express.Router();
router.use(cookieParser());

type int = number;
type double = number;

async function getServerLife(): Promise<object> {
    const usedMemory = process.memoryUsage();
    const totalMemory = os.totalmem();

    const heapTotalMB = Math.round(usedMemory.heapTotal / (1024 * 1024));
    const heapUsedMB = Math.round(usedMemory.heapUsed / (1024 * 1024));
    const externalMB = Math.round(usedMemory.external / (1024 * 1024));
    const rssMB = Math.round(usedMemory.rss / (1024 * 1024));
    const totalMemoryMB = Math.round(totalMemory / (1024 * 1024));

    const args = process.argv.slice(2);
    const flsmxArg = args.find(arg => arg.startsWith('--FLSmX='));
    let totalMemoryArgMB = 0;

    if (flsmxArg) {
        const totalMemoryArg = flsmxArg.split('=')[1];
        if (totalMemoryArg.endsWith('G')) {
            totalMemoryArgMB = parseInt(totalMemoryArg) * 1024;
        } else if (totalMemoryArg.endsWith('M')) {
            totalMemoryArgMB = parseInt(totalMemoryArg);
        }
    }

    return {
        AllocatedMemory: totalMemoryArgMB,
        UsedMemory: rssMB,
        HeapTotal: heapTotalMB,
        HeapUsed: heapUsedMB,
        BufferMemory: externalMB,
        MachineTotalMemory: totalMemoryMB,
    };
}

router.post('/', async (req: express.Request, res: express.Response) => {
    const serverLife = await getServerLife();
    res.json(serverLife);
});
router.get('/', async (req: express.Request, res: express.Response) => {
    const serverLife = await getServerLife();
    res.json(serverLife);
});
/* router.get('/d', async (req: express.Request, res: express.Response) => {
    res.render('debugWindow', { GDPSID: GDPSID });
}); */

export default router;

