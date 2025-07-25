'package net.fimastgd.forevercore.routes.serverlife';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const settings_1 = require("../serverconf/settings");
const os_1 = __importDefault(require("os"));
const db = require("../serverconf/db");
const GDPSID = settings_1.settings.GDPSID.toString();
const router = express_1.default.Router();
router.use((0, cookie_parser_1.default)());
async function getServerLife() {
    const usedMemory = process.memoryUsage();
    const totalMemory = os_1.default.totalmem();
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
        }
        else if (totalMemoryArg.endsWith('M')) {
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
router.post('/', async (req, res) => {
    const serverLife = await getServerLife();
    res.json(serverLife);
});
router.get('/', async (req, res) => {
    const serverLife = await getServerLife();
    res.json(serverLife);
});
/* router.get('/d', async (req: express.Request, res: express.Response) => {
    res.render('debugWindow', { GDPSID: GDPSID });
}); */
exports.default = router;
