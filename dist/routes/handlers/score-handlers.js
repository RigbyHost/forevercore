"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserScoreHandler = exports.GetScoresHandler = exports.GetLevelScoresPlatHandler = exports.GetLevelScoresHandler = exports.GetCreatorsHandler = void 0;
exports.createScoresHandlers = createScoresHandlers;
const api_router_1 = require("../api-router");
const getCreators_1 = __importDefault(require("../../api/scores/getCreators"));
const getLevelScores_1 = __importDefault(require("../../api/scores/getLevelScores"));
const getLevelScoresPlat_1 = __importDefault(require("../../api/scores/getLevelScoresPlat"));
const getScores_1 = __importDefault(require("../../api/scores/getScores"));
const updateUserScore_1 = __importDefault(require("../../api/scores/updateUserScore"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class GetCreatorsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJCreators.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getCreators_1.default)(req.body.accountID, req.body.type);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetCreatorsHandler', `Error getting creators: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetCreatorsHandler = GetCreatorsHandler;
class GetLevelScoresHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJLevelScores.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getLevelScores_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.levelID, req.body.percent, req.body.s1, req.body.s2, req.body.s3, req.body.s6, req.body.s9, req.body.s10, req.body.type, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetLevelScoresHandler', `Error getting level scores: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetLevelScoresHandler = GetLevelScoresHandler;
class GetLevelScoresPlatHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJLevelScoresPlat.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getLevelScoresPlat_1.default)(req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetLevelScoresPlatHandler', `Error getting platformer level scores: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetLevelScoresPlatHandler = GetLevelScoresPlatHandler;
class GetScoresHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJScores.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getScores_1.default)(req.body.gameVersion, req.body.accountID, req.body.udid, req.body.type, req.body.count, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetScoresHandler', `Error getting scores: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetScoresHandler = GetScoresHandler;
class UpdateUserScoreHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/updateGJUserScore.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, updateUserScore_1.default)(req.body.accountID, req.body.userName, req.body.secret, req.body.stars, req.body.demons, req.body.icon, req.body.color1, req.body.color2, req.body.gameVersion, req.body.binaryVersion, req.body.coins, req.body.iconType, req.body.userCoins, req.body.special, req.body.accIcon, req.body.accShip, req.body.accBall, req.body.accBird, req.body.accDart, req.body.accRobot, req.body.accGlow, req.body.accSpider, req.body.accExplosion, req.body.diamonds, req.body.moons, req.body.color3, req.body.accSwing, req.body.accJetpack, req.body.dinfo, req.body.dinfow, req.body.dinfog, req.body.sinfo, req.body.sinfod, req.body.sinfog, req.body.udid, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UpdateUserScoreHandler', `Error updating user score: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UpdateUserScoreHandler = UpdateUserScoreHandler;
function createScoresHandlers() {
    return [
        new GetCreatorsHandler(),
        new GetLevelScoresHandler(),
        new GetLevelScoresPlatHandler(),
        new GetScoresHandler(),
        new UpdateUserScoreHandler()
    ];
}
