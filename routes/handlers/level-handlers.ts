// routes/handlers/level-handlers.ts
'package net.fimastgd.forevercore.routes.handlers.level-handlers';

import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import uploadLevel from '../../api/levels/uploadLevel';
import getLevels from '../../api/levels/getLevels';
import downloadLevel from '../../api/levels/downloadLevel';
import deleteLevelUser from '../../api/levels/deleteLevelUser';
import rateStars from '../../api/levels/rateStars';
import suggestStars from '../../api/levels/suggestStars';
import rateDemon from '../../api/levels/rateDemon';
import reportLevel from '../../api/levels/reportLevel';
import updateDesc from '../../api/levels/updateDesc';
import getDailyLevel from '../../api/levels/getDailyLevel';
import ConsoleApi from '../../modules/console-api';

/**
 * Handler for uploading levels
 */
export class UploadLevelHandler extends BaseApiHandler {
    constructor(path: string = '/uploadGJLevel.php') {
        super(path);
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const {
                password, udid, accountID, gjp2, gjp, gameVersion, userName,
                levelID, levelName, levelDesc, levelVersion, levelLength,
                audioTrack, secret, binaryVersion, auto, original,
                twoPlayer, songID, objects, coins, requestedStars,
                extraString, levelString, levelInfo, unlisted, unlisted1,
                unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts
            } = req.body;

            const result = await uploadLevel(
                password, udid, accountID, gjp2, gjp, gameVersion, userName,
                levelID, levelName, levelDesc, levelVersion, levelLength,
                audioTrack, secret, binaryVersion, auto, original,
                twoPlayer, songID, objects, coins, requestedStars,
                extraString, levelString, levelInfo, unlisted, unlisted1,
                unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('UploadLevelHandler', `Error uploading level: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for uploading levels (GD 1.9)
 */
export class UploadLevel19Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel19.php');
    }
}

/**
 * Handler for uploading levels (GD 2.0)
 */
export class UploadLevel20Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel20.php');
    }
}

/**
 * Handler for uploading levels (GD 2.1)
 */
export class UploadLevel21Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel21.php');
    }
}

/**
 * Handler for getting level list
 */
export class GetLevelsHandler extends BaseApiHandler {
    constructor(path: string = '/getGJLevels.php') {
        super(path);
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const {
                gameVersion, binaryVersion, type, diff, uncompleted,
                original, coins, completedLvls, onlyCompleted, song,
                customSong, twoPlayer, star, noStar, gauntlet, len,
                featured, epic, mythic, legendary, demonFilter, str,
                page, followed, accountID, gjp, gjp2
            } = req.body;

            const result = await getLevels(
                gameVersion, binaryVersion, type, diff, uncompleted,
                original, coins, completedLvls, onlyCompleted, song,
                customSong, twoPlayer, star, noStar, gauntlet, len,
                featured, epic, mythic, legendary, demonFilter, str,
                page, followed, accountID, gjp, gjp2, req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetLevelsHandler', `Error getting levels: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for getting level list (GD 1.9)
 */
export class GetLevels19Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels19.php');
    }
}

/**
 * Handler for getting level list (GD 2.0)
 */
export class GetLevels20Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels20.php');
    }
}

/**
 * Handler for getting level list (GD 2.1)
 */
export class GetLevels21Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels21.php');
    }
}

/**
 * Handler for downloading levels
 */
export class DownloadLevelHandler extends BaseApiHandler {
    constructor(path: string = '/downloadGJLevel.php') {
        super(path);
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await downloadLevel(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req.body.gameVersion,
                req.body.levelID,
                req.body.extras,
                req.body.inc,
                req.body.binaryVersion,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('DownloadLevelHandler', `Error downloading level: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for downloading levels (GD 1.9)
 */
export class DownloadLevel19Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel19.php');
    }
}

/**
 * Handler for downloading levels (GD 2.0)
 */
export class DownloadLevel20Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel20.php');
    }
}

/**
 * Handler for downloading levels (GD 2.1)
 */
export class DownloadLevel21Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel21.php');
    }
}

/**
 * Handler for downloading levels (GD 2.2)
 */
export class DownloadLevel22Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel22.php');
    }
}

/**
 * Handler for deleting levels
 */
export class DeleteLevelHandler extends BaseApiHandler {
    constructor() {
        super('/deleteGJLevelUser20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await deleteLevelUser(
                req.body.levelID,
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('DeleteLevelHandler', `Error deleting level: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for rating level stars
 */
export class RateStarsHandler extends BaseApiHandler {
    constructor(path: string = '/rateGJStars20.php') {
        super(path);
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await rateStars(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req.body.stars,
                req.body.levelID,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('RateStarsHandler', `Error rating stars: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for rating level stars (GD 2.1)
 */
export class RateStars211Handler extends RateStarsHandler {
    constructor() {
        super('/rateGJStars211.php');
    }
}

/**
 * Handler for suggesting stars
 */
export class SuggestStarsHandler extends BaseApiHandler {
    constructor() {
        super('/suggestGJStars20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await suggestStars(
                req.body.gjp2,
                req.body.gjp,
                req.body.stars,
                req.body.feature,
                req.body.levelID,
                req.body.accountID,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('SuggestStarsHandler', `Error suggesting stars: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for rating demon difficulty
 */
export class RateDemonHandler extends BaseApiHandler {
    constructor() {
        super('/rateGJDemon21.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await rateDemon(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req.body.rating,
                req.body.levelID,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('RateDemonHandler', `Error rating demon: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for reporting levels
 */
export class ReportLevelHandler extends BaseApiHandler {
    constructor() {
        super('/reportGJLevel.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await reportLevel(req.body.levelID, req);
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('ReportLevelHandler', `Error reporting level: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for updating level description
 */
export class UpdateDescHandler extends BaseApiHandler {
    constructor() {
        super('/updateGJDesc20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const { accountID, gjp2, gjp, levelID, levelDesc, udid } = req.body;

            const result = await updateDesc(
                accountID,
                gjp2,
                gjp,
                levelID,
                levelDesc,
                udid,
                req
            );

            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('UpdateDescHandler', `Error updating description: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Handler for getting daily level
 */
export class GetDailyLevelHandler extends BaseApiHandler {
    constructor() {
        super('/getGJDailyLevel.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getDailyLevel(req.body.type, req.body.weekly);
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetDailyLevelHandler', `Error getting daily level: ${error}`);
            res.status(200).send('-1');
        }
    }
}

/**
 * Create all level handlers
 * @returns Array of level API handlers
 */
export function createLevelHandlers() {
    return [
        new UploadLevelHandler(),
        new UploadLevel19Handler(),
        new UploadLevel20Handler(),
        new UploadLevel21Handler(),
        new GetLevelsHandler(),
        new GetLevels19Handler(),
        new GetLevels20Handler(),
        new GetLevels21Handler(),
        new DownloadLevelHandler(),
        new DownloadLevel19Handler(),
        new DownloadLevel20Handler(),
        new DownloadLevel21Handler(),
        new DownloadLevel22Handler(),
        new DeleteLevelHandler(),
        new RateStarsHandler(),
        new RateStars211Handler(),
        new SuggestStarsHandler(),
        new RateDemonHandler(),
        new ReportLevelHandler(),
        new UpdateDescHandler(),
        new GetDailyLevelHandler()
    ];
}

export default createLevelHandlers;