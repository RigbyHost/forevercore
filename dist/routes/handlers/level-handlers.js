// routes/handlers/level-handlers.ts
'package net.fimastgd.forevercore.routes.handlers.level-handlers';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDailyLevelHandler = exports.UpdateDescHandler = exports.ReportLevelHandler = exports.RateDemonHandler = exports.SuggestStarsHandler = exports.RateStars211Handler = exports.RateStarsHandler = exports.DeleteLevelHandler = exports.DownloadLevel22Handler = exports.DownloadLevel21Handler = exports.DownloadLevel20Handler = exports.DownloadLevel19Handler = exports.DownloadLevelHandler = exports.GetLevels21Handler = exports.GetLevels20Handler = exports.GetLevels19Handler = exports.GetLevelsHandler = exports.UploadLevel21Handler = exports.UploadLevel20Handler = exports.UploadLevel19Handler = exports.UploadLevelHandler = void 0;
exports.createLevelHandlers = createLevelHandlers;
const api_router_1 = require("../api-router");
const uploadLevel_1 = __importDefault(require("../../api/levels/uploadLevel"));
const getLevels_1 = __importDefault(require("../../api/levels/getLevels"));
const downloadLevel_1 = __importDefault(require("../../api/levels/downloadLevel"));
const deleteLevelUser_1 = __importDefault(require("../../api/levels/deleteLevelUser"));
const rateStars_1 = __importDefault(require("../../api/levels/rateStars"));
const suggestStars_1 = __importDefault(require("../../api/levels/suggestStars"));
const rateDemon_1 = __importDefault(require("../../api/levels/rateDemon"));
const reportLevel_1 = __importDefault(require("../../api/levels/reportLevel"));
const updateDesc_1 = __importDefault(require("../../api/levels/updateDesc"));
const getDailyLevel_1 = __importDefault(require("../../api/levels/getDailyLevel"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Handler for uploading levels
 */
class UploadLevelHandler extends api_router_1.BaseApiHandler {
    constructor(path = '/uploadGJLevel.php') {
        super(path);
    }
    async handle(req, res) {
        try {
            const { password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts } = req.body;
            const result = await (0, uploadLevel_1.default)(password, udid, accountID, gjp2, gjp, gameVersion, userName, levelID, levelName, levelDesc, levelVersion, levelLength, audioTrack, secret, binaryVersion, auto, original, twoPlayer, songID, objects, coins, requestedStars, extraString, levelString, levelInfo, unlisted, unlisted1, unlisted2, ldm, wt, wt2, settingsString, songIDs, sfxIDs, ts, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UploadLevelHandler', `Error uploading level: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UploadLevelHandler = UploadLevelHandler;
/**
 * Handler for uploading levels (GD 1.9)
 */
class UploadLevel19Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel19.php');
    }
}
exports.UploadLevel19Handler = UploadLevel19Handler;
/**
 * Handler for uploading levels (GD 2.0)
 */
class UploadLevel20Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel20.php');
    }
}
exports.UploadLevel20Handler = UploadLevel20Handler;
/**
 * Handler for uploading levels (GD 2.1)
 */
class UploadLevel21Handler extends UploadLevelHandler {
    constructor() {
        super('/uploadGJLevel21.php');
    }
}
exports.UploadLevel21Handler = UploadLevel21Handler;
/**
 * Handler for getting level list
 */
class GetLevelsHandler extends api_router_1.BaseApiHandler {
    constructor(path = '/getGJLevels.php') {
        super(path);
    }
    async handle(req, res) {
        try {
            const { gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2 } = req.body;
            const result = await (0, getLevels_1.default)(gameVersion, binaryVersion, type, diff, uncompleted, original, coins, completedLvls, onlyCompleted, song, customSong, twoPlayer, star, noStar, gauntlet, len, featured, epic, mythic, legendary, demonFilter, str, page, followed, accountID, gjp, gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetLevelsHandler', `Error getting levels: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetLevelsHandler = GetLevelsHandler;
/**
 * Handler for getting level list (GD 1.9)
 */
class GetLevels19Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels19.php');
    }
}
exports.GetLevels19Handler = GetLevels19Handler;
/**
 * Handler for getting level list (GD 2.0)
 */
class GetLevels20Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels20.php');
    }
}
exports.GetLevels20Handler = GetLevels20Handler;
/**
 * Handler for getting level list (GD 2.1)
 */
class GetLevels21Handler extends GetLevelsHandler {
    constructor() {
        super('/getGJLevels21.php');
    }
}
exports.GetLevels21Handler = GetLevels21Handler;
/**
 * Handler for downloading levels
 */
class DownloadLevelHandler extends api_router_1.BaseApiHandler {
    constructor(path = '/downloadGJLevel.php') {
        super(path);
    }
    async handle(req, res) {
        try {
            const result = await (0, downloadLevel_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.gameVersion, req.body.levelID, req.body.extras, req.body.inc, req.body.binaryVersion, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DownloadLevelHandler', `Error downloading level: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DownloadLevelHandler = DownloadLevelHandler;
/**
 * Handler for downloading levels (GD 1.9)
 */
class DownloadLevel19Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel19.php');
    }
}
exports.DownloadLevel19Handler = DownloadLevel19Handler;
/**
 * Handler for downloading levels (GD 2.0)
 */
class DownloadLevel20Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel20.php');
    }
}
exports.DownloadLevel20Handler = DownloadLevel20Handler;
/**
 * Handler for downloading levels (GD 2.1)
 */
class DownloadLevel21Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel21.php');
    }
}
exports.DownloadLevel21Handler = DownloadLevel21Handler;
/**
 * Handler for downloading levels (GD 2.2)
 */
class DownloadLevel22Handler extends DownloadLevelHandler {
    constructor() {
        super('/downloadGJLevel22.php');
    }
}
exports.DownloadLevel22Handler = DownloadLevel22Handler;
/**
 * Handler for deleting levels
 */
class DeleteLevelHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/deleteGJLevelUser20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, deleteLevelUser_1.default)(req.body.levelID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DeleteLevelHandler', `Error deleting level: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DeleteLevelHandler = DeleteLevelHandler;
/**
 * Handler for rating level stars
 */
class RateStarsHandler extends api_router_1.BaseApiHandler {
    constructor(path = '/rateGJStars20.php') {
        super(path);
    }
    async handle(req, res) {
        try {
            const result = await (0, rateStars_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.stars, req.body.levelID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('RateStarsHandler', `Error rating stars: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.RateStarsHandler = RateStarsHandler;
/**
 * Handler for rating level stars (GD 2.1)
 */
class RateStars211Handler extends RateStarsHandler {
    constructor() {
        super('/rateGJStars211.php');
    }
}
exports.RateStars211Handler = RateStars211Handler;
/**
 * Handler for suggesting stars
 */
class SuggestStarsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/suggestGJStars20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, suggestStars_1.default)(req.body.gjp2, req.body.gjp, req.body.stars, req.body.feature, req.body.levelID, req.body.accountID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('SuggestStarsHandler', `Error suggesting stars: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.SuggestStarsHandler = SuggestStarsHandler;
/**
 * Handler for rating demon difficulty
 */
class RateDemonHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/rateGJDemon21.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, rateDemon_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.rating, req.body.levelID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('RateDemonHandler', `Error rating demon: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.RateDemonHandler = RateDemonHandler;
/**
 * Handler for reporting levels
 */
class ReportLevelHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/reportGJLevel.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, reportLevel_1.default)(req.body.levelID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('ReportLevelHandler', `Error reporting level: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.ReportLevelHandler = ReportLevelHandler;
/**
 * Handler for updating level description
 */
class UpdateDescHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/updateGJDesc20.php');
    }
    async handle(req, res) {
        try {
            const { accountID, gjp2, gjp, levelID, levelDesc, udid } = req.body;
            const result = await (0, updateDesc_1.default)(accountID, gjp2, gjp, levelID, levelDesc, udid, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UpdateDescHandler', `Error updating description: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UpdateDescHandler = UpdateDescHandler;
/**
 * Handler for getting daily level
 */
class GetDailyLevelHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJDailyLevel.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getDailyLevel_1.default)(req.body.type, req.body.weekly);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetDailyLevelHandler', `Error getting daily level: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetDailyLevelHandler = GetDailyLevelHandler;
/**
 * Create all level handlers
 * @returns Array of level API handlers
 */
function createLevelHandlers() {
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
exports.default = createLevelHandlers;
