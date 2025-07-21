"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChestsHandler = exports.GetChallengesHandler = void 0;
exports.createRewardsHandlers = createRewardsHandlers;
const api_router_1 = require("../api-router");
const getChallenges_1 = __importDefault(require("../../api/rewards/getChallenges"));
const getChests_1 = __importDefault(require("../../api/rewards/getChests"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class GetChallengesHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJChallenges.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getChallenges_1.default)(req.body.accountID, req.body.udid, req.body.chk);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetChallengesHandler', `Error getting challenges: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetChallengesHandler = GetChallengesHandler;
class GetChestsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJChests.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getChests_1.default)(req.body.chk, req.body.rewardType, req.body.udid, req.body.accountID, req.body.gameVersion, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetChestsHandler', `Error getting chests: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetChestsHandler = GetChestsHandler;
function createRewardsHandlers() {
    return [
        new GetChallengesHandler(),
        new GetChestsHandler()
    ];
}
