"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMapPacksHandler = exports.GetGauntletsHandler = void 0;
exports.createPacksHandlers = createPacksHandlers;
const api_router_1 = require("../api-router");
const getGauntlets_1 = __importDefault(require("../../api/packs/getGauntlets"));
const getMapPacks_1 = __importDefault(require("../../api/packs/getMapPacks"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class GetGauntletsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJGauntlets.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getGauntlets_1.default)();
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetGauntletsHandler', `Error getting gauntlets: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetGauntletsHandler = GetGauntletsHandler;
class GetMapPacksHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJMapPacks.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getMapPacks_1.default)(req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetMapPacksHandler', `Error getting map packs: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetMapPacksHandler = GetMapPacksHandler;
function createPacksHandlers() {
    return [
        new GetGauntletsHandler(),
        new GetMapPacksHandler()
    ];
}
